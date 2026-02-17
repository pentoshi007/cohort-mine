# 🛠️ Manual Deployment Guide — Without CI/CD

> **Autoscaling Orchestrator — Deploy to AWS completely manually**
> No GitHub Actions, no automation — just you, your terminal, and the AWS Console.
> Perfect for learning what every step does before automating it.

---

## 📑 Table of Contents

| #   | Topic                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------- |
| 1   | [Overview — What We'll Do](#1--overview--what-well-do)                                                |
| 2   | [Prerequisites](#2--prerequisites)                                                                    |
| 3   | [Step 1: Configure AWS Credentials](#3--step-1-configure-aws-credentials)                             |
| 4   | [Step 2: Create a Key Pair](#4--step-2-create-a-key-pair)                                             |
| 5   | [Step 3: Create a Security Group](#5--step-3-create-a-security-group)                                 |
| 6   | [Step 4: Launch the Orchestrator on a Single EC2](#6--step-4-launch-the-orchestrator-on-a-single-ec2) |
| 7   | [Step 5: Build & Push Docker Image to ECR](#7--step-5-build--push-docker-image-to-ecr)                |
| 8   | [Step 6: Create a Custom AMI](#8--step-6-create-a-custom-ami)                                         |
| 9   | [Step 7: Create a Launch Template](#9--step-7-create-a-launch-template)                               |
| 10  | [Step 8: Create an Auto Scaling Group](#10--step-8-create-an-auto-scaling-group)                      |
| 11  | [Step 9: Create a Scaling Policy](#11--step-9-create-a-scaling-policy)                                |
| 12  | [Step 10: Manual Update / Redeployment](#12--step-10-manual-update--redeployment)                     |
| 13  | [Step 11: Test Everything](#13--step-11-test-everything)                                              |
| 14  | [Step 12: Cleanup (Avoid Surprise Bills!)](#14--step-12-cleanup-avoid-surprise-bills)                 |
| 15  | [Troubleshooting](#15--troubleshooting)                                                               |
| 16  | [Complete .env Reference](#16--complete-env-reference)                                                |

---

## 1 — Overview — What We'll Do

We'll manually deploy the autoscaling orchestrator to AWS. No CI/CD — every step done by hand so you understand exactly what happens.

```
  Your Laptop                              AWS Cloud
  ───────────                             ──────────

  1. Build Docker image    ────────→  2. Push to ECR (image registry)
                                           │
  3. Create Security Group ────────→  4. Create Key Pair
                                           │
  5. Launch EC2 instance   ────────→  6. SSH in, install Docker
                                           │
  7. Create AMI (snapshot) ────────→  8. Create Launch Template
                                           │
                                      9. Create ASG (auto-scaling)
                                           │
                                     10. ASG launches instances
                                           │
                                     11. Each instance pulls Docker
                                         image & runs the app
                                           │
                                      🎉  App is live!
```

### Architecture Diagram

```mermaid
flowchart TD
    A["📦 Your Code<br/>(local machine)"] -->|docker build & push| B["🐳 ECR<br/>(Docker Registry)"]
    B --> C["📋 Launch Template<br/>(AMI + User Data)"]
    C --> D["🔄 Auto Scaling Group<br/>(min=1, max=5)"]
    D --> E1["🖥️ EC2 Instance #1<br/>Pulls image from ECR<br/>Runs orchestrator on :3000"]
    D --> E2["🖥️ EC2 Instance #2<br/>(added when CPU > 50%)"]

    E1 -->|"POST /machines"| F1["🖥️ Workspace EC2<br/>code-server on :8080"]
    E1 -->|"POST /machines"| F2["🖥️ Workspace EC2<br/>code-server on :8080"]

    style B fill:#2496ed,color:white
    style D fill:#22c55e,color:white
    style E1 fill:#f59e0b,color:white
    style E2 fill:#f59e0b,color:white
    style F1 fill:#8b5cf6,color:white
    style F2 fill:#8b5cf6,color:white
```

---

## 2 — Prerequisites

Make sure you have these installed on your local machine:

```bash
# Check Node.js (need v22+)
node -v              # → v22.x.x

# Check Docker
docker --version     # → Docker version 24.x.x

# Check AWS CLI
aws --version        # → aws-cli/2.x.x

# Check Git
git --version        # → git version 2.x.x
```

**If AWS CLI is not installed:**

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

**You also need:**

- An **AWS Account** (free tier: [aws.amazon.com/free](https://aws.amazon.com/free/))
- The orchestrator project code (already in `29-week-29/autoscaling-orchestrator/`)

---

## 3 — Step 1: Configure AWS Credentials

### 3.1 — Create an IAM User

An **IAM (Identity and Access Management) User** is a set of credentials that lets your CLI and app talk to AWS.

> **Why not use the root account?**
> The root account has unlimited permissions. If those keys leak, an attacker can do ANYTHING — delete your entire infrastructure, rack up $100,000 bills. IAM users have limited, specific permissions.

**In the AWS Console:**

1. Go to **IAM → Users → Create User**
2. **User name:** `orchestrator-bot`
3. Click **Next**
4. **Permissions options:** Select "Attach policies directly"
5. Search and select these policies:

| Policy Name                            | What It Allows                          |
| -------------------------------------- | --------------------------------------- |
| `AmazonEC2FullAccess`                  | Create/terminate/describe EC2 instances |
| `AmazonEC2ContainerRegistryFullAccess` | Push/pull Docker images to/from ECR     |
| `AutoScalingFullAccess`                | Create/manage Auto Scaling Groups       |

6. Click **Next → Create User**

### 3.2 — Create Access Keys

1. Click on the user `orchestrator-bot`
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **"Command Line Interface (CLI)"**
5. Click **Create access key**
6. **⚠️ COPY BOTH VALUES NOW** — the secret key is shown only once!

### 3.3 — Configure AWS CLI

```bash
aws configure
# It will ask:
#   AWS Access Key ID:     → paste your access key
#   AWS Secret Access Key: → paste your secret key
#   Default region name:   → us-east-1  (or your preferred region)
#   Default output format: → json

# Verify it works:
aws sts get-caller-identity
# → {
#     "UserId": "AIDA...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/orchestrator-bot"
#   }
```

### 3.4 — Put Credentials in `.env`

```bash
cd "29-week-29/autoscaling-orchestrator"
cp .env.example .env
```

Edit `.env` and fill in:

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
```

---

## 4 — Step 2: Create a Key Pair

A **Key Pair** is how you authenticate when SSH-ing into your EC2 instances. AWS stores the public key; you keep the private key (`.pem` file).

### Via AWS Console:

1. Go to **EC2 → Network & Security → Key Pairs**
2. Click **Create Key Pair**
3. Configure:

| Setting         | Value              |
| --------------- | ------------------ |
| **Name**        | `orchestrator-key` |
| **Type**        | RSA                |
| **File format** | `.pem`             |

4. Click **Create key pair** → `.pem` file downloads automatically

### Via CLI (alternative):

```bash
aws ec2 create-key-pair \
  --key-name orchestrator-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/orchestrator-key.pem
```

### Secure the Key File:

```bash
# Move to .ssh directory (if downloaded to Downloads)
mv ~/Downloads/orchestrator-key.pem ~/.ssh/

# Set permissions — ONLY you can read this file
chmod 400 ~/.ssh/orchestrator-key.pem

# Why 400?
#   4 = read permission for owner
#   0 = no permissions for group
#   0 = no permissions for others
# SSH refuses to use keys with loose permissions!
```

### Update `.env`:

```bash
AWS_KEY_PAIR_NAME=orchestrator-key
```

---

## 5 — Step 3: Create a Security Group

A **Security Group** acts as a firewall for your EC2 instances. It controls which network traffic is allowed in and out.

### Via AWS Console:

1. Go to **EC2 → Network & Security → Security Groups**
2. Click **Create security group**
3. Fill in:

| Field           | Value                                          |
| --------------- | ---------------------------------------------- |
| **Name**        | `orchestrator-sg`                              |
| **Description** | `Allow SSH, HTTP, app port 3000, VS Code 8080` |
| **VPC**         | Select your default VPC                        |

4. **Inbound rules** — click "Add rule" for each:

| Type       | Protocol | Port Range | Source    | Description             |
| ---------- | -------- | ---------- | --------- | ----------------------- |
| SSH        | TCP      | 22         | My IP     | SSH access from your IP |
| HTTP       | TCP      | 80         | 0.0.0.0/0 | HTTP from anywhere      |
| Custom TCP | TCP      | 3000       | 0.0.0.0/0 | Orchestrator API        |
| Custom TCP | TCP      | 8080       | 0.0.0.0/0 | VS Code (code-server)   |

5. **Outbound rules:** Leave the default "All traffic → 0.0.0.0/0"
6. Click **Create security group**
7. **Copy the Security Group ID** (e.g. `sg-0a1b2c3d4e5f67890`)

### Via CLI (alternative):

```bash
# Create the security group
SG_ID=$(aws ec2 create-security-group \
  --group-name orchestrator-sg \
  --description "Allow SSH, HTTP, App, VS Code" \
  --query 'GroupId' --output text)

echo "Security Group ID: $SG_ID"

# Add inbound rules
aws ec2 authorize-security-group-ingress --group-id $SG_ID \
  --protocol tcp --port 22 --cidr $(curl -s ifconfig.me)/32   # SSH from your IP

aws ec2 authorize-security-group-ingress --group-id $SG_ID \
  --protocol tcp --port 80 --cidr 0.0.0.0/0                   # HTTP

aws ec2 authorize-security-group-ingress --group-id $SG_ID \
  --protocol tcp --port 3000 --cidr 0.0.0.0/0                 # App API

aws ec2 authorize-security-group-ingress --group-id $SG_ID \
  --protocol tcp --port 8080 --cidr 0.0.0.0/0                 # VS Code
```

### Update `.env`:

```bash
AWS_SECURITY_GROUP_ID=sg-0a1b2c3d4e5f67890
```

### Visual: What the Security Group Does

```
  Internet                    Security Group                  EC2 Instance
  ────────                   ────────────────                ─────────────
                         ┌──────────────────────┐
  SSH (port 22)     ──→  │  ✅ ALLOW (your IP)  │  ──→  App can be accessed
  HTTP (port 80)    ──→  │  ✅ ALLOW (anywhere)  │  ──→  via these ports
  API (port 3000)   ──→  │  ✅ ALLOW (anywhere)  │
  VS Code (port 8080)──→ │  ✅ ALLOW (anywhere)  │
  MySQL (port 3306) ──→  │  ❌ BLOCKED           │  ──→  Not in rules = blocked
  Random (port 9999)──→  │  ❌ BLOCKED           │
                         └──────────────────────┘
```

---

## 6 — Step 4: Launch the Orchestrator on a Single EC2

Before auto-scaling, let's get the app running on a **single instance** first.

### 6.1 — Find the Ubuntu AMI ID

```bash
# Find the latest Ubuntu 22.04 AMI in your region
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
             "Name=state,Values=available" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text

# Example output: ami-0c7217cdde317cfec
```

Or manually: **EC2 → AMI Catalog → Search "Ubuntu 22.04" → Copy AMI ID**

### Update `.env`:

```bash
AWS_AMI_ID=ami-0c7217cdde317cfec
```

### 6.2 — Launch the Instance

```bash
# Launch an EC2 instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t2.micro \
  --key-name orchestrator-key \
  --security-group-ids sg-0a1b2c3d4e5f67890 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=orchestrator-manual}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instance ID: $INSTANCE_ID"

# Wait for it to be running
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
echo "Instance is running!"

# Get the public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Public IP: $PUBLIC_IP"
```

### 6.3 — SSH In and Set Up

```bash
# SSH into the instance
ssh -i ~/.ssh/orchestrator-key.pem ubuntu@$PUBLIC_IP
```

**Once inside the instance:**

```bash
# ── 1. Update system ────────────────────────────────────
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Install Docker ───────────────────────────────────
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# ── 3. Install Node.js 22 (for running without Docker) ──
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
node -v    # → v22.x.x

# ── 4. Install AWS CLI ──────────────────────────────────
sudo apt-get install -y awscli

# ── 5. Clone and set up the project ─────────────────────
git clone https://github.com/pentoshi007/cohort-mine.git ~/cohort
cd ~/cohort/29-week-29/autoscaling-orchestrator

# ── 6. Install dependencies ─────────────────────────────
npm install

# ── 7. Create .env on the server ────────────────────────
cp .env.example .env
nano .env
# Fill in your real AWS credentials, AMI ID, SG ID, key name, etc.

# ── 8. Build TypeScript ─────────────────────────────────
npm run build

# ── 9. Start the app (test it works) ────────────────────
node dist/index.js
# 🚀 Autoscaling Orchestrator is running!
# 📡 http://localhost:3000

# Press Ctrl+C to stop

# ── 10. Install PM2 and run in background ───────────────
npm install -g pm2
pm2 start dist/index.js --name orchestrator
pm2 save
pm2 startup
# Run the command PM2 prints — it sets up auto-start on boot

# ── 11. Verify ──────────────────────────────────────────
pm2 list
# ┌────┬──────────────┬──────┬──────┐
# │ id │ name         │ mode │ status │
# │ 0  │ orchestrator │ fork │ online │
# └────┴──────────────┴──────┴──────┘

curl http://localhost:3000/health
# → { "status": "ok", ... }
```

### 6.4 — Test From Your Local Machine

```bash
# From your local machine (not the EC2 instance)
curl http://$PUBLIC_IP:3000/health
# → { "status": "ok", "uptime": 42.5, ... }

curl http://$PUBLIC_IP:3000
# → { "name": "Autoscaling Orchestrator API", ... }
```

> **🎉 Your app is running on a single EC2!** Now let's make it auto-scalable.

---

## 7 — Step 5: Build & Push Docker Image to ECR

### 7.1 — Create the ECR Repository

```bash
# Create a private Docker image repository
aws ecr create-repository \
  --repository-name autoscaling-orchestrator \
  --region us-east-1

# Note the repositoryUri from output:
# "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator"
```

### 7.2 — Build the Docker Image Locally

```bash
cd "29-week-29/autoscaling-orchestrator"

# Build the image
docker build -t autoscaling-orchestrator:latest .

# Verify it built
docker images | grep orchestrator
# REPOSITORY                    TAG       SIZE
# autoscaling-orchestrator      latest    ~150 MB
```

### 7.3 — Login to ECR

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"

# Login to ECR (authenticate Docker to push to your private registry)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com

# → "Login Succeeded"
```

### 7.4 — Tag and Push

```bash
# Tag the local image with the ECR repository URI
docker tag autoscaling-orchestrator:latest \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:latest

# Push the image to ECR
docker push \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:latest

# ✅ Image is now in ECR!
```

### Visual: What Just Happened

```
  Your Laptop                            AWS ECR (Private Registry)
  ───────────                           ─────────────────────────

  ┌──────────────────────┐   docker push   ┌──────────────────────┐
  │ autoscaling-         │ ──────────────→  │ 123456789012.dkr.    │
  │ orchestrator:latest  │                  │ ecr.us-east-1.       │
  │ (~150 MB)            │                  │ amazonaws.com/       │
  └──────────────────────┘                  │ autoscaling-         │
                                            │ orchestrator:latest  │
                                            └──────────────────────┘
                                                    │
                                            Any EC2 in this account
                                            can pull this image!
```

---

## 8 — Step 6: Create a Custom AMI

An **AMI (Amazon Machine Image)** is a snapshot of your instance. New instances launched from this AMI will have Docker pre-installed — no setup needed.

### 8.1 — Create the AMI

We'll snapshot the instance we set up in Step 4 (which already has Docker + AWS CLI):

**Via Console:**

1. Go to **EC2 → Instances** → select `orchestrator-manual`
2. Click **Actions → Image and templates → Create image**
3. Configure:

| Setting         | Value                                       |
| --------------- | ------------------------------------------- |
| **Image Name**  | `orchestrator-base-v1`                      |
| **Description** | `Ubuntu 22.04 + Docker + AWS CLI + Node 22` |
| **No Reboot**   | ✅ Check this (keeps instance running)      |

4. Click **Create Image**

**Via CLI:**

```bash
# Create AMI from the running instance
AMI_ID=$(aws ec2 create-image \
  --instance-id $INSTANCE_ID \
  --name "orchestrator-base-v1" \
  --description "Ubuntu 22.04 + Docker + AWS CLI + Node 22" \
  --no-reboot \
  --query 'ImageId' \
  --output text)

echo "AMI ID: $AMI_ID"

# Wait for the AMI to be available (5-10 min)
aws ec2 wait image-available --image-ids $AMI_ID
echo "AMI is ready!"
```

### What's In This AMI?

```
  ┌──────────────────────────────────┐
  │  AMI: orchestrator-base-v1       │
  │  ──────────────────────────────  │
  │  ✅ Ubuntu 22.04 LTS             │
  │  ✅ Docker 24.x (installed)      │
  │  ✅ AWS CLI 2.x (installed)      │
  │  ✅ Node.js 22 via NVM           │
  │  ✅ PM2 (process manager)        │
  │  ✅ Our app code (cloned)        │
  └──────────────────────────────────┘
       │
       │  Any instance launched from this AMI
       │  gets ALL of the above automatically!
       │
       ├──→ EC2 #1 (exact copy)
       ├──→ EC2 #2 (exact copy)
       └──→ EC2 #3 (exact copy)
```

---

## 9 — Step 7: Create a Launch Template

A **Launch Template** is a blueprint that tells AWS: _"When creating new instances, use THESE settings."_

### Via Console:

1. Go to **EC2 → Launch Templates → Create launch template**
2. Configure:

| Setting                  | Value                                       |
| ------------------------ | ------------------------------------------- |
| **Template Name**        | `orchestrator-template`                     |
| **Template Description** | `Orchestrator on Docker with code-server`   |
| **AMI**                  | Select `orchestrator-base-v1` (from Step 6) |
| **Instance Type**        | `t2.micro` (free tier) or `t3.medium`       |
| **Key Pair**             | `orchestrator-key`                          |
| **Security Group**       | `orchestrator-sg`                           |

3. Expand **Advanced details** → scroll to **User Data** → paste this script:

```bash
#!/bin/bash
set -e

# ── This script runs EVERY TIME a new instance starts ───
# It pulls the latest Docker image from ECR and runs it.

REGION=us-east-1
ACCOUNT_ID=<YOUR-12-DIGIT-ACCOUNT-ID>
REPO=autoscaling-orchestrator

# Wait for Docker to be ready
until docker info &>/dev/null; do
  echo "Waiting for Docker..."
  sleep 2
done

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Pull the latest Docker image
docker pull ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest

# Run the app
docker run -d \
  -p 3000:3000 \
  --restart unless-stopped \
  --name orchestrator \
  -e AWS_ACCESS_KEY_ID=<YOUR-ACCESS-KEY> \
  -e AWS_SECRET_ACCESS_KEY=<YOUR-SECRET-KEY> \
  -e AWS_REGION=$REGION \
  -e AWS_AMI_ID=<YOUR-AMI-ID> \
  -e AWS_INSTANCE_TYPE=t2.micro \
  -e AWS_KEY_PAIR_NAME=orchestrator-key \
  -e AWS_SECURITY_GROUP_ID=<YOUR-SG-ID> \
  -e CODER_PASSWORD=your-strong-password \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest

echo "✅ Orchestrator is running on port 3000"
```

> **⚠️ Replace ALL `<PLACEHOLDERS>`** with your actual values!

4. Click **Create launch template**

### Via CLI:

```bash
# Encode User Data as Base64
USER_DATA=$(cat <<'EOF' | base64
#!/bin/bash
set -e
REGION=us-east-1
ACCOUNT_ID=123456789012
REPO=autoscaling-orchestrator

until docker info &>/dev/null; do sleep 2; done

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

docker pull ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest
docker run -d -p 3000:3000 --restart unless-stopped --name orchestrator \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:latest
EOF
)

aws ec2 create-launch-template \
  --launch-template-name orchestrator-template \
  --launch-template-data "{
    \"ImageId\": \"$AMI_ID\",
    \"InstanceType\": \"t2.micro\",
    \"KeyName\": \"orchestrator-key\",
    \"SecurityGroupIds\": [\"sg-0a1b2c3d4e5f67890\"],
    \"UserData\": \"$USER_DATA\"
  }"
```

### How the Launch Template Works

```
  Launch Template (orchestrator-template)
  ┌─────────────────────────────────────┐
  │  AMI:       orchestrator-base-v1    │
  │  Type:      t2.micro                │
  │  Key:       orchestrator-key        │
  │  SG:        orchestrator-sg         │
  │  User Data: (startup script)        │
  │    1. Login to ECR                  │
  │    2. Pull Docker image             │
  │    3. Run container on port 3000    │
  └─────────────────────────────────────┘
       │
       │  When ASG needs a new instance,
       │  it uses THIS template to create it.
       │
       ▼
  ┌──────────────────┐
  │  New EC2 boots   │
  │  User Data runs  │
  │  App is live!    │
  └──────────────────┘
       No manual SSH needed!
```

---

## 10 — Step 8: Create an Auto Scaling Group

The **ASG** automatically maintains the right number of instances based on demand.

### Via Console:

1. Go to **EC2 → Auto Scaling Groups → Create Auto Scaling Group**

#### Page 1: Choose Launch Template

| Setting             | Value                   |
| ------------------- | ----------------------- |
| **ASG Name**        | `orchestrator-asg`      |
| **Launch Template** | `orchestrator-template` |
| **Version**         | Latest                  |

#### Page 2: Choose Instance Launch Options

| Setting                          | Value                                                  |
| -------------------------------- | ------------------------------------------------------ |
| **VPC**                          | Your default VPC                                       |
| **Availability Zones & Subnets** | Select **at least 2** (e.g. us-east-1a and us-east-1b) |

> **Why 2+ Availability Zones?** If one AZ (data center) goes down, your app survives in the other.

#### Page 3: Configure Advanced Options

| Setting               | Value            |
| --------------------- | ---------------- |
| **Load Balancing**    | No load balancer |
| **Health Check Type** | EC2 (default)    |
| **Grace Period**      | 300 seconds      |

> **Why no load balancer?** In our architecture, each instance is a dedicated orchestrator with its own IP. Users connect directly to a specific instance.

#### Page 4: Configure Group Size

| Setting     | Value | Meaning                             |
| ----------- | ----- | ----------------------------------- |
| **Desired** | 1     | Start with 1 instance               |
| **Minimum** | 1     | Never go below 1 (always available) |
| **Maximum** | 5     | Never exceed 5 (cost protection!)   |

#### Page 5: Configure Scaling Policies

Select **None** for now — we'll add a policy in the next step.

#### Page 6: Add Notifications (Optional)

You can add an SNS topic to get email alerts when instances are launched/terminated.

#### Page 7: Add Tags

| Key         | Value                       |
| ----------- | --------------------------- |
| `Name`      | `orchestrator-asg-instance` |
| `Project`   | `autoscaling-orchestrator`  |
| `ManagedBy` | `ASG`                       |

2. Click **Create Auto Scaling Group**

### Via CLI:

```bash
# Get subnet IDs for at least 2 AZs
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=default-for-az,Values=true" \
  --query 'Subnets[0:2].SubnetId' \
  --output text | tr '\t' ',')

aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name orchestrator-asg \
  --launch-template LaunchTemplateName=orchestrator-template,Version='$Latest' \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 1 \
  --vpc-zone-identifier "$SUBNETS" \
  --tags "Key=Name,Value=orchestrator-asg-instance,PropagateAtLaunch=true"

echo "✅ ASG created! It will launch 1 instance now."
```

### Verify the ASG Created an Instance

```bash
# Check the ASG status
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names orchestrator-asg \
  --query 'AutoScalingGroups[0].{
    Desired:DesiredCapacity,
    Min:MinSize,
    Max:MaxSize,
    Instances:Instances[*].InstanceId
  }'

# Expected output:
# {
#     "Desired": 1,
#     "Min": 1,
#     "Max": 5,
#     "Instances": ["i-0abc123def456"]
# }
```

---

## 11 — Step 9: Create a Scaling Policy

The **Scaling Policy** tells the ASG _when_ to add or remove instances.

### Target Tracking Policy (Recommended for beginners)

```bash
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name orchestrator-asg \
  --policy-name orchestrator-cpu-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 50.0,
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

**What this does:**

| Condition     | Action                   | Cooldown |
| ------------- | ------------------------ | -------- |
| Avg CPU > 50% | Launch new instances     | 60 sec   |
| Avg CPU < 50% | Terminate idle instances | 300 sec  |

```
  CPU Usage     ASG Response
  ─────────     ────────────
  20%           Scale IN  → remove instances (slowly, 5min cooldown)
  30%           Do nothing (below target but within range)
  50%           ← TARGET — this is where we want to be
  60%           Scale OUT → add 1 instance (fast, 1min cooldown)
  80%           Scale OUT → add more instances
  95%           Scale OUT → add even more instances
```

### Via Console:

1. Go to **EC2 → Auto Scaling Groups → Select `orchestrator-asg`**
2. Click **Automatic scaling** tab
3. Click **Create dynamic scaling policy**
4. Configure:

| Setting          | Value                   |
| ---------------- | ----------------------- |
| **Policy type**  | Target tracking scaling |
| **Metric type**  | Average CPU utilisation |
| **Target value** | 50                      |

5. Click **Create**

---

## 12 — Step 10: Manual Update / Redeployment

When you change your code and want to redeploy (without CI/CD):

### 12.1 — Build & Push New Docker Image

```bash
# 1. Make your code changes locally
cd "29-week-29/autoscaling-orchestrator"

# 2. Rebuild the image
docker build -t autoscaling-orchestrator:v2 .

# 3. Login to ECR
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com

# 4. Tag and push with version AND latest
docker tag autoscaling-orchestrator:v2 \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:v2
docker tag autoscaling-orchestrator:v2 \
  ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:latest

docker push ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:v2
docker push ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/autoscaling-orchestrator:latest
```

### 12.2 — Trigger Instance Refresh

```bash
# Tell the ASG to replace all instances with fresh ones
# (fresh ones will pull the newest Docker image via User Data)
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name orchestrator-asg \
  --preferences '{
    "MinHealthyPercentage": 50,
    "InstanceWarmup": 120
  }'

# Check the refresh status
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name orchestrator-asg \
  --query 'InstanceRefreshes[0].{Status:Status,Progress:PercentageComplete}'
```

### What Happens During Instance Refresh

```
  Before (v1):        During Refresh:       After (v2):
  ┌────┐              ┌────┐ ┌────┐         ┌────┐
  │ v1 │              │ v2 │ │ v1 │         │ v2 │
  │ ✅ │              │ ✅ │ │ 🔄 │         │ ✅ │
  └────┘              └────┘ └────┘         └────┘
  1 instance          New one created,      Old one terminated,
  running             old one draining      only v2 running
```

---

## 13 — Step 11: Test Everything

### Find Your Instance IPs

```bash
# List all instances in the ASG
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=orchestrator-asg-instance" \
            "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' \
  --output table

# Example:
# ┌──────────────────────┬───────────────┬─────────┐
# │ i-0abc123def456      │ 54.123.45.67  │ running │
# └──────────────────────┴───────────────┴─────────┘
```

### Test the API

```bash
IP=54.123.45.67   # Replace with your instance IP

# 1. Health check
curl http://$IP:3000/health
# → { "status": "ok", "uptime": 42.5 }

# 2. List available endpoints
curl http://$IP:3000
# → { "name": "Autoscaling Orchestrator API", "endpoints": {...} }

# 3. Create a new workspace machine
curl -X POST http://$IP:3000/machines \
  -H "Content-Type: application/json" \
  -d '{"projectName": "my-first-workspace"}'
# → { "success": true, "data": { "instanceId": "i-0xyz...", "state": "pending" } }

# 4. Wait 2-3 minutes, then list machines
curl http://$IP:3000/machines
# → Shows the new instance with its public IP and VS Code URL

# 5. Get details of the workspace
curl http://$IP:3000/machines/i-0xyz789
# → { "vscodeUrl": "http://52.xx.xx.xx:8080" }

# 6. Open VS Code in your browser!
open http://52.xx.xx.xx:8080
# → Enter the CODER_PASSWORD from your .env
# → Full VS Code editor in the browser! 🎉

# 7. When done, terminate the workspace
curl -X DELETE http://$IP:3000/machines/i-0xyz789
# → { "currentState": "shutting-down" }
```

---

## 14 — Step 12: Cleanup (Avoid Surprise Bills!)

> **⚠️ VERY IMPORTANT!** AWS charges for running instances. Clean up when you're done learning.

```bash
# ── 1. Delete the ASG (terminates all instances it manages) ──
aws autoscaling delete-auto-scaling-group \
  --auto-scaling-group-name orchestrator-asg \
  --force-delete
# --force-delete terminates instances even if capacity > 0

# ── 2. Delete the Launch Template ────────────────────────────
aws ec2 delete-launch-template \
  --launch-template-name orchestrator-template

# ── 3. Deregister the AMI ────────────────────────────────────
aws ec2 deregister-image --image-id $AMI_ID

# ── 4. Terminate the manual instance (if still running) ──────
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# ── 5. Delete ECR repository (and all images) ────────────────
aws ecr delete-repository \
  --repository-name autoscaling-orchestrator \
  --force

# ── 6. Delete Security Group ─────────────────────────────────
aws ec2 delete-security-group --group-id sg-0a1b2c3d4e5f67890

# ── 7. Delete Key Pair ───────────────────────────────────────
aws ec2 delete-key-pair --key-name orchestrator-key
rm ~/.ssh/orchestrator-key.pem

echo "✅ Everything cleaned up! No more charges."
```

**Via Console:** You can do all of the above through the AWS Console by navigating to each service and deleting the resources.

---

## 15 — Troubleshooting

### Common Errors and Fixes

| Problem                                       | Cause                            | Fix                                                    |
| --------------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| `ssh: Connection refused`                     | Instance not ready yet           | Wait 1-2 minutes, try again                            |
| `Permission denied (publickey)`               | Wrong key file or permissions    | `chmod 400 key.pem`, verify key name matches           |
| `curl: Connection refused` on port 3000       | App not running                  | SSH in, check `pm2 list` or `docker ps`                |
| `UnauthorizedAccess` from AWS SDK             | Wrong credentials in `.env`      | Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` |
| `InvalidAMIID.NotFound`                       | AMI ID is for a different region | Check `AWS_REGION` matches where the AMI was created   |
| User Data script not running                  | Check cloud-init logs            | `cat /var/log/cloud-init-output.log` on the instance   |
| Docker image not pulling in User Data         | ECR login failed                 | Ensure instance has IAM role with ECR permissions      |
| ASG not launching instances                   | Check Activity History           | ASG → Activity tab → look for error messages           |
| `Error: Cannot find module './dist/index.js'` | TypeScript not compiled          | Run `npm run build` first                              |
| Docker container exits immediately            | Missing env vars                 | Check `docker logs orchestrator` for the error         |

### Useful Debug Commands (On the EC2 Instance)

```bash
# Check if the app is running
pm2 list                    # If using PM2
docker ps                   # If using Docker

# View application logs
pm2 logs orchestrator       # PM2 logs
docker logs orchestrator    # Docker logs

# Check cloud-init (User Data) logs
sudo cat /var/log/cloud-init-output.log

# Check if ports are listening
sudo netstat -tlnp | grep -E '3000|8080'

# Test the app locally on the instance
curl http://localhost:3000/health
```

---

## 16 — Complete `.env` Reference

Here's what your final `.env` file should look like (with example values):

```bash
# ── Server Configuration ────────────────────────────────
PORT=3000

# ── AWS Credentials ─────────────────────────────────────
# From: IAM → Users → orchestrator-bot → Security Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# ── EC2 Instance Configuration ──────────────────────────
# AMI: Ubuntu 22.04 LTS (us-east-1)
AWS_AMI_ID=ami-0c7217cdde317cfec

# Instance type: t2.micro = free tier eligible
AWS_INSTANCE_TYPE=t2.micro

# Key pair: EC2 → Key Pairs → orchestrator-key
AWS_KEY_PAIR_NAME=orchestrator-key

# Security group: EC2 → Security Groups → orchestrator-sg
AWS_SECURITY_GROUP_ID=sg-0a1b2c3d4e5f67890

# ── VS Code Server (code-server) ────────────────────────
# This password is set on the VS Code running in the browser
CODER_PASSWORD=MyStr0ng!Password
```

---

> **📝 Next Steps:** Once comfortable with manual deployment, try the CI/CD pipeline in the main guide ([29.1-autoscaling-orchestrator.md](./29.1-autoscaling-orchestrator.md#10--cicd-pipeline--github-actions)) to automate everything!

---

_Last updated: February 2026 | Week 29.1 — Manual Deployment Guide_
