npm install -g pm2
pm2 start index.js --name "my-app"
pm2 list
pm2 stop my-app
pm2 delete my-app
pm2 logs my-app
pm2 show my-app
pm2 monit
pm2 save
pm2 startup
pm2 save --force
pm2 reload all
pm2 restart all

## Process management (overview)

- **What is a process?**

  - A running instance of a program (e.g. `node index.js`).
  - Has its own memory, PID (process ID), environment variables, and open files/sockets.

- **Why we need process management**

  - **Keep services running**: restart automatically if they crash.
  - **Start on boot**: apps should come up automatically when the server restarts.
  - **Run in background**: don’t be tied to an open terminal session.
  - **Observe & debug**: view logs, CPU/memory usage, and current status.

- **Basic approaches**
  - **Manual**: `node index.js &` (background job), but:
    - Dies when the shell/session dies (unless carefully detached).
    - No automatic restart or monitoring.
  - **OS service managers**: `systemd`, `launchd`, etc.
    - More powerful but more configuration-heavy.
  - **App-level process managers**: `pm2`, `forever`, `supervisord`, etc.
    - Focused on app lifecycle, logs, and zero-downtime reloads.

## PM2 as a process manager

- **What PM2 gives you**

  - **Daemonizes** your Node.js app (keeps it running in the background).
  - **Auto-restart** on crashes or when the file changes (with watch mode).
  - **Process naming & grouping** (so you don’t rely only on PIDs).
  - **Startup on boot** via `pm2 startup` + `pm2 save`.
  - **Centralized logs** through `pm2 logs` and log files.
  - **Monitoring dashboard** with `pm2 monit`.
  - **Zero-downtime reloads** for production: `pm2 reload all` or by name.

- **Typical lifecycle with PM2**
  - **Install globally**: `npm install -g pm2`
  - **Start an app**: `pm2 start index.js --name "my-app"`
  - **Inspect state**: `pm2 list`, `pm2 show my-app`, `pm2 logs my-app`, `pm2 monit`
  - **Control processes**: `pm2 stop my-app`, `pm2 restart all`, `pm2 delete my-app`
  - **Make it persistent across reboots**:
    - Generate startup script: `pm2 startup`
    - Save current process list: `pm2 save` (or `pm2 save --force` to overwrite)

## CI/CD

- **What is CI/CD?**
  - CI/CD stands for **Continuous Integration** and **Continuous Deployment/Delivery**.
  - The goal is to move code from your laptop to production **safely, quickly, and repeatedly**.

### Continuous Integration (CI)

- **Idea**
  - Developers frequently integrate (merge/push) their code changes into a shared repository, often several times a day.
  - Each integration is automatically verified by a CI pipeline that:
    1. **Builds the project**.
    2. **Runs automated tests**.
- **Why it matters**
  - Detect problems early, right after a small change.
  - Improve overall software quality by forcing tests to run consistently.
  - Reduce the time it takes to validate and release new updates.

### Continuous Deployment (CD)

- **Idea**
  - As the name suggests, you **continuously deploy** your code to different environments (`dev` / `stage` / `prod`) once it has passed CI.
- **How it usually works**
  - CI produces a deployable artifact (e.g. Docker image, build folder, package).
  - CD steps automatically roll out that artifact to the target environment using scripts/tools (GitHub Actions, GitLab CI, ArgoCD, etc.).
- **Benefits**
  - Smaller, more frequent releases = less risky deployments.
  - Faster feedback from users and stakeholders.
  - Less manual, error-prone deployment work; more repeatable, scripted processes.

### Example: Simple CI pipeline with GitHub Actions (Node.js)

Create a workflow file like `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
```

- **What this does**
  - Triggers on every `push` or PR to `main`.
  - Checks out the repository, sets up Node.js, installs dependencies, then runs your test suite.
  - If tests fail, the commit/PR is considered “red” and should be fixed before merging.

### Example: Add a very basic CD step

You can extend the workflow to deploy when CI passes (e.g. SSH to a server and restart PM2):

```yaml
deploy:
  needs: build-and-test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'

  steps:
    - name: Deploy via SSH and PM2
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /var/www/my-app
          git pull origin main
          npm install --production
          pm2 reload my-app || pm2 start index.js --name "my-app"
```

- **What this does**
  - Runs only after `build-and-test` succeeds and only on the `main` branch.
  - Logs into your server via SSH using GitHub Secrets for credentials.
  - Pulls the latest code, installs production dependencies, and uses `pm2` to reload (or start) the app.

## Full CI/CD example – Next.js notes app deployed to EC2 with PM2

### Assumptions for this example

- **App**: standard Next.js notes app with:
  - `npm install`
  - `npm run build`
  - `npm run start` (or `next start`) to serve on port `3000`.
- **EC2 instance**:
  - Node.js and `npm` already installed.
  - `pm2` installed globally: `npm install -g pm2`.
  - Code cloned into `/var/www/next-notes-app` (any path is fine, just be consistent).
- **GitHub Secrets configured in the repo**:
  - `EC2_HOST`: public IP / DNS of your EC2 instance.
  - `EC2_USER`: SSH username (e.g. `ubuntu`, `ec2-user`).
  - `EC2_SSH_KEY`: private key for that user (contents of your `.pem` file).

### GitHub Actions workflow file

Create `.github/workflows/next-notes-ec2.yml` in your repository:

```yaml
name: CI/CD – Next.js Notes app to EC2

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  # 1) CI: build & test the Next.js app
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test --if-present

      - name: Build Next.js app
        run: npm run build

  # 2) CD: deploy to EC2 using SSH + PM2
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout repository (optional)
        uses: actions/checkout@v4

      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            echo "==> Go to app directory on EC2"
            cd /var/www/next-notes-app

            echo "==> Fetch latest code"
            git pull origin main

            echo "==> Install dependencies (prod only)"
            npm install --production

            echo "==> Build Next.js app"
            npm run build

            echo "==> Start or reload app with PM2"
            # Start once, then subsequent runs will use reload
            if pm2 describe next-notes-app > /dev/null 2>&1; then
              pm2 reload next-notes-app
            else
              # Adjust script / port if your start command is different
              pm2 start npm --name "next-notes-app" -- run start
            fi

            echo "==> Save PM2 process list so it survives reboot"
            pm2 save
```

### Explanation of the workflow

- **Triggers (`on`)**

  - **`push` to `main`**: every time you push to `main`, both CI and CD run.
  - **`workflow_dispatch`**: lets you manually trigger the pipeline from the GitHub Actions UI for re-deploys.

- **Job `build-and-test` (CI)**

  - **`runs-on: ubuntu-latest`**: uses a fresh Linux runner for a clean environment.
  - **Checkout repository**: `actions/checkout@v4` pulls your code into the runner.
  - **Setup Node.js**:
    - `actions/setup-node@v4` installs Node 20.
    - `cache: npm` speeds up repeated installs across runs.
  - **Install dependencies**: `npm install` downloads all packages defined in `package.json`.
  - **Run tests**: `npm test --if-present` runs tests if you defined a `test` script (otherwise it just skips).
  - **Build Next.js app**: `npm run build` ensures your app can compile successfully; if this fails, the workflow stops and nothing is deployed.

- **Job `deploy` (CD)**

  - **`needs: build-and-test`**: deploy only runs if the CI job completed successfully.
  - **`if: github.ref == 'refs/heads/main'`**: extra guard so only the real `main` branch can deploy, even if someone triggers the workflow by mistake on other branches.
  - **Checkout repository (optional)**: not strictly required for SSH deploy, but sometimes useful if you want to use repo files (scripts, templates) inside this job.
  - **Deploy to EC2 via SSH**:
    - Uses `appleboy/ssh-action` to SSH into EC2 with `EC2_HOST`, `EC2_USER`, and `EC2_SSH_KEY` secrets.
    - All commands in `script: |` run directly on the EC2 server.

- **Commands run on EC2**
  - `cd /var/www/next-notes-app`: move into the directory where the Next.js app lives.
  - `git pull origin main`: pull the latest code from the `main` branch.
  - `npm install --production`: install only production dependencies (lighter and faster than full install).
  - `npm run build`: build the optimized Next.js production output.
  - **PM2 section**:
    - `pm2 describe next-notes-app > /dev/null 2>&1`: checks whether a PM2 process named `next-notes-app` already exists.
    - If it exists → `pm2 reload next-notes-app` does a zero-downtime reload using the freshly built code.
    - If it does **not** exist → `pm2 start npm --name "next-notes-app" -- run start` starts `npm run start` under PM2 and names the process `next-notes-app`.
  - `pm2 save`: saves the PM2 process list, so after you configure `pm2 startup` on the server, the notes app will automatically restart on machine reboot.
