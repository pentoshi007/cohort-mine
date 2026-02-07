


Dev / Staging / Production environments
---------------------------------------

- **Typical branches**
  - `dev` (or `develop`): active development, unstable.
  - `staging`: stable builds that QA tests before release.
  - `main` / `master` (production): only tested, production‑ready code.

- **Typical infrastructure**
  - **Dev / Staging server**: used for internal testing (your GitHub Actions "staging" deployments can target this).
  - **Production server**: public traffic.
  - Each server should have:
    - Node.js + `pnpm`
    - Nginx
    - PM2 (or another process manager)

Server setup (Ubuntu example)
-----------------------------

- **Install basics (on both staging and prod servers)**:

```bash
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm pm2
```

- **SSH access**
  - Generate an SSH key on your CI machine / laptop and add the public key to `~/.ssh/authorized_keys` on each server.
  - Always use key-based auth; disable password login in production.

Domain and DNS layout
---------------------

Assume you own `domain-name.com` and this project is "week-25".

- **Production A records** (point to the production server IP):
  - `week25-fe.domain-name.com` → prod server IP (frontend)
  - `week25-server.domain-name.com` → prod server IP (HTTP API)
  - `week25-ws.domain-name.com` → prod server IP (WebSocket)

- **Staging A records** (point to the staging server IP):
  - `staging.week25-fe.domain-name.com` → staging server IP
  - `staging.week25-server.domain-name.com` → staging server IP
  - `staging.week25-ws.domain-name.com` → staging server IP

Clone repo and install dependencies
-----------------------------------

```bash
# on each server (staging and prod)
cd /home/ubuntu
git clone git@github.com:<your-username>/25.2-dep-certificates-cicd.git
cd 25.2-dep-certificates-cicd
pnpm install
```

Environment variables and secrets
---------------------------------

- **Do NOT commit secrets** (DB passwords, JWT secrets, API keys).
- Recommended options:
  - Use `.env` files on each server (owned by `ubuntu`, mode `600`).
  - Or use a secrets manager (AWS SSM, HashiCorp Vault, Doppler, etc.).
- In CI (GitHub Actions):
  - Store values in **Repository → Settings → Secrets and variables → Actions**.
  - Read them into the remote server either:
    - Through SSH commands that write them to `.env`, or
    - By using a deployment script on the server that reads from existing `.env`.

Databases and Prisma
--------------------

- **Separate DBs**:
  - `yourdb_dev` or `yourdb_staging` for staging.
  - `yourdb_prod` for production.

- **Prisma migrations**:
  - For dev/staging:  
    ```bash
    npx prisma migrate dev
    ```
  - For production (recommended by latest Prisma docs):  
    ```bash
    npx prisma migrate deploy
    ```

Build and run with PNPM
-----------------------

- **Build (on each server)**:

```bash
pnpm install
pnpm run build
```

- **Start with PM2** (one process per app inside the monorepo):

```bash
# example: HTTP server
cd apps/http-server
pm2 start "pnpm start" --name http-server

# WebSocket server
cd ../ws
pm2 start "pnpm start" --name ws-server

# Frontend (Next.js / React)
cd ../fe
pm2 start "pnpm start" --name fe

pm2 save       # persist across restarts
pm2 status
```

Nginx as reverse proxy
----------------------

- **Example snippet** (on each server, adjust `proxy_pass` ports to your apps):

```bash
sudo nano /etc/nginx/sites-available/week25.conf
```

```nginx
server {
    listen 80;
    server_name week25-fe.domain-name.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name week25-server.domain-name.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name week25-ws.domain-name.com;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass http://127.0.0.1:5000;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/week25.conf /etc/nginx/sites-enabled/week25.conf
sudo nginx -t
sudo systemctl reload nginx
```

Branch protection for production
--------------------------------

On GitHub → `Settings` → `Branches` → `Branch protection rules`:

- Protect `main` (or `production`) branch:
  - **Require pull requests before merging**.
  - **Require status checks to pass** (CI must be green).
  - **Require review from at least 1 or 2 reviewers**.
  - Optionally **restrict who can push** directly.

CI/CD with GitHub Actions
-------------------------

- **Files** (in the repo):
  - `.github/workflows/cd_staging.yml`
  - `.github/workflows/cd_prod.yml`

- **Required GitHub secrets** (example):
  - `STAGING_SSH_KEY`
  - `STAGING_HOST`
  - `STAGING_USER`
  - `PROD_SSH_KEY`
  - `PROD_HOST`
  - `PROD_USER`

Example: deploy to staging on push to `main`
-------------------------------------------

`.github/workflows/cd_staging.yml`:

```yaml
name: Deploy to staging

on:
  push:
    branches:
      - main

jobs:
  redeploy_everything:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: "pnpm"

      - name: Add SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.STAGING_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H "${{ secrets.STAGING_HOST }}" >> ~/.ssh/known_hosts

      - name: Deploy to staging server
        run: |
          ssh -i ~/.ssh/id_rsa ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd /home/ubuntu/25.2-dep-certificates-cicd
            git pull
            pnpm install
            pnpm run build
            # apply DB migrations for staging
            npx prisma migrate dev
            pm2 restart all || pm2 start ecosystem.config.cjs
          EOF
```

Example: deploy to production on tag or release
----------------------------------------------

`.github/workflows/cd_prod.yml`:

```yaml
name: Deploy to production

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  deploy_prod:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: "pnpm"

      - name: Add SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PROD_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H "${{ secrets.PROD_HOST }}" >> ~/.ssh/known_hosts

      - name: Deploy to production server
        run: |
          ssh -i ~/.ssh/id_rsa ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} << 'EOF'
            cd /home/ubuntu/25.2-dep-certificates-cicd
            git pull
            pnpm install
            pnpm run build
            # safest for prod DB
            npx prisma migrate deploy
            pm2 restart all || pm2 start ecosystem.config.cjs
          EOF
```


