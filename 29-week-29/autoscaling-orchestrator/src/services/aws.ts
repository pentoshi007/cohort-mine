// ─────────────────────────────────────────────────────────
// src/services/aws.ts — AWS EC2 service layer
// ─────────────────────────────────────────────────────────
// This file wraps the AWS SDK v3 EC2 client. It provides
// simple functions that the routes call:
//   createMachine()  → launches a new EC2 instance
//   deleteMachine()  → terminates an EC2 instance
//   listMachines()   → lists all running instances
//   getMachineById() → gets details + public IP of one instance
//
// WHY a separate service file?
//   → Keeps route handlers thin (just HTTP logic)
//   → Easy to swap AWS for another cloud later
//   → Easy to mock/test
// ─────────────────────────────────────────────────────────

import {
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstancesCommand,
  type RunInstancesCommandInput,
  type _InstanceType,
} from "@aws-sdk/client-ec2";
import { config } from "../config";

// ── 1. Create the EC2 client (one shared instance) ──────
// The client holds our credentials and region so we don't
// repeat them in every call.
const ec2Client = new EC2Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// ── 2. User Data script ─────────────────────────────────
// This bash script runs when a new EC2 instance boots.
// It installs Docker and launches code-server (VS Code in
// the browser) inside a Docker container.
//
// After the instance starts, users can open their browser
// and go to  http://<INSTANCE-IP>:8080  to get a full
// VS Code editor running on the cloud machine.
function generateUserData(): string {
  const script = `#!/bin/bash
set -e

# ── Update system packages ─────────────────────────────
sudo apt-get update -y
sudo apt-get upgrade -y

# ── Install Docker ──────────────────────────────────────
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

# ── Pull and run code-server (VS Code in browser) ──────
# code-server is Coder's open-source project that runs
# VS Code as a web application. We run it in Docker so
# the host machine stays clean.
sudo docker run -d \\
  --name code-server \\
  -p 8080:8080 \\
  -e PASSWORD=${config.coderPassword} \\
  -v /home/ubuntu/project:/home/coder/project \\
  --restart unless-stopped \\
  codercom/code-server:latest

echo "✅ code-server is running on port 8080"
`;

  // AWS requires User Data to be Base64 encoded
  return Buffer.from(script).toString("base64");
}

// ─────────────────────────────────────────────────────────
// 3. PUBLIC FUNCTIONS — called by the route handlers
// ─────────────────────────────────────────────────────────

/**
 * createMachine() — Launch a new EC2 instance
 *
 * Steps:
 *  1. Build the RunInstances parameters (AMI, type, key, SG, user data)
 *  2. Send the command to AWS
 *  3. Return the new instance's ID
 */
export async function createMachine(projectName: string) {
  const params: RunInstancesCommandInput = {
    ImageId: config.ec2.amiId, // Which OS image
    InstanceType: config.ec2.instanceType as _InstanceType, // Cast to AWS SDK enum type
    MinCount: 1, // Launch exactly 1 instance
    MaxCount: 1,
    KeyName: config.ec2.keyPairName, // SSH key for manual access
    SecurityGroupIds: [config.ec2.securityGroupId], // Firewall rules
    UserData: generateUserData(), // Startup script (base64)

    // Tags help you identify instances in the AWS console
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [
          { Key: "Name", Value: `orchestrator-${projectName}` },
          { Key: "Project", Value: projectName },
          { Key: "ManagedBy", Value: "autoscaling-orchestrator" },
        ],
      },
    ],
  };

  // Send the command to AWS
  const command = new RunInstancesCommand(params);
  const response = await ec2Client.send(command);

  // Extract the new instance details
  const instance = response.Instances?.[0];
  if (!instance || !instance.InstanceId) {
    throw new Error("AWS did not return an instance ID");
  }

  return {
    instanceId: instance.InstanceId,
    state: instance.State?.Name || "pending",
    message: `Instance launched. VS Code will be available at http://<PUBLIC-IP>:8080 once the instance is running.`,
  };
}

/**
 * deleteMachine() — Terminate an EC2 instance by ID
 */
export async function deleteMachine(instanceId: string) {
  const command = new TerminateInstancesCommand({
    InstanceIds: [instanceId],
  });

  const response = await ec2Client.send(command);
  const change = response.TerminatingInstances?.[0];

  return {
    instanceId,
    previousState: change?.PreviousState?.Name || "unknown",
    currentState: change?.CurrentState?.Name || "shutting-down",
  };
}

/**
 * listMachines() — List all instances managed by this orchestrator
 *
 * We filter by the tag "ManagedBy = autoscaling-orchestrator"
 * so we only see OUR instances, not everything in the AWS account.
 */
export async function listMachines() {
  const command = new DescribeInstancesCommand({
    Filters: [
      {
        Name: "tag:ManagedBy",
        Values: ["autoscaling-orchestrator"],
      },
      {
        // Don't show terminated instances
        Name: "instance-state-name",
        Values: ["pending", "running", "stopping", "stopped"],
      },
    ],
  });

  const response = await ec2Client.send(command);

  // Flatten the nested AWS response into a simple array
  const machines = (response.Reservations || []).flatMap((reservation) =>
    (reservation.Instances || []).map((instance) => ({
      instanceId: instance.InstanceId,
      state: instance.State?.Name,
      publicIp: instance.PublicIpAddress || "not-assigned-yet",
      projectName:
        instance.Tags?.find((tag) => tag.Key === "Project")?.Value || "unknown",
      launchTime: instance.LaunchTime,
      vscodeUrl: instance.PublicIpAddress
        ? `http://${instance.PublicIpAddress}:8080`
        : "not-available-yet",
    })),
  );

  return machines;
}

/**
 * getMachineById() — Get details of a single instance
 */
export async function getMachineById(instanceId: string) {
  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });

  const response = await ec2Client.send(command);
  const instance = response.Reservations?.[0]?.Instances?.[0];

  if (!instance) {
    return null;
  }

  return {
    instanceId: instance.InstanceId,
    state: instance.State?.Name,
    publicIp: instance.PublicIpAddress || "not-assigned-yet",
    privateIp: instance.PrivateIpAddress,
    projectName:
      instance.Tags?.find((tag) => tag.Key === "Project")?.Value || "unknown",
    instanceType: instance.InstanceType,
    launchTime: instance.LaunchTime,
    vscodeUrl: instance.PublicIpAddress
      ? `http://${instance.PublicIpAddress}:8080`
      : "not-available-yet",
  };
}
