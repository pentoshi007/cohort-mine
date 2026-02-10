# 27.1 Docker Compose Example - Beginner Step-by-Step Guide

This README is for first-time learners.

Goal: run a simple Users API using:

- Bun + Express (app)
- Prisma (ORM)
- PostgreSQL (database)
- Docker / Docker Compose (containers)

If you are new, follow commands in order. Do not skip steps.

---

## 1) What this project does

API endpoints:

- `GET /health` -> checks app + DB connection
- `GET /users` -> list users
- `POST /users` -> create user
- `DELETE /users/:id` -> delete user

---

## 2) Important files and why they exist

- `docker-compose.yml`
  - starts `postgres` and `app` together.

- `DockerFile`
  - defines how app image is built.

- `.env.example`
  - sample environment values for local run.

- `prisma/schema.prisma`
  - data model (`User` table).

- `prisma/migrations/*`
  - SQL migration history.

- `prisma.config.ts`
  - Prisma config reads `DATABASE_URL`.

- `src/index.ts`
  - Express API code and Prisma client setup.

- `package.json`
  - scripts like `dev`, `prisma:generate`, `prisma:migrate`.

---

## 3) Prerequisites (install first)

You need:

- Docker Desktop
- Bun

Check installation:

```bash
docker --version
docker compose version
bun --version
```

---

## 4) Method A (Best for learning): app on host, DB in Docker

This method is easiest for beginners because you can run app directly with Bun and only DB in container.

### Step A1: go to folder

```bash
cd 27-week-27/27.1-docker-compose-example
```

### Step A2: install dependencies

```bash
bun install
```

What it does:

- installs all packages from `package.json`
- uses versions locked in `bun.lock`

### Step A3: create `.env`

```bash
cp .env.example .env
```

Expected `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/usersdb?schema=public"
PORT=3000
```

Meaning:

- app connects to DB at `localhost:5432`
- app runs on port `3000`

### Step A4: start PostgreSQL container

```bash
docker rm -f pg-users 2>/dev/null || true

docker run -d \
  --name pg-users \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=usersdb \
  -p 5432:5432 \
  -v pg-users-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Command breakdown:

- `docker rm -f pg-users` removes old container if it exists.
- `docker run` starts a new container.
- `-d` runs it in background.
- `--name pg-users` names the container.
- `-e` options set DB username/password/dbname.
- `-p 5432:5432` maps host port to container DB port.
- `-v pg-users-data:/var/lib/postgresql/data` keeps DB data in volume.

### Step A5: setup Prisma

```bash
bun run prisma:generate
bun run prisma:migrate
```

What these do:

- `prisma:generate` creates Prisma client code.
- `prisma:migrate` creates/applies migration (dev mode).

### Step A6: run app

```bash
bun run dev
```

You should see API started on `http://localhost:3000`.

### Step A7: test APIs

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"username":"aniket"}'
curl http://localhost:3000/users
curl -X DELETE http://localhost:3000/users/<USER_ID>
```

---

## 5) Method B (Full Docker): app + DB with Compose

Use this when you want both services containerized.

### Step B1: go to folder

```bash
cd 27-week-27/27.1-docker-compose-example
```

### Step B2: start full stack

```bash
docker compose up --build -d
```

Breakdown:

- `docker compose up` starts services from `docker-compose.yml`
- `--build` rebuilds app image before start
- `-d` runs in background

What happens internally:

- `postgres` container starts
- healthcheck waits until DB is ready
- `app` container starts
- app runs `bunx prisma migrate deploy` then starts server

### Step B3: check running status

```bash
docker compose ps
docker compose logs -f
```

### Step B4: test APIs

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"username":"aniket"}'
curl http://localhost:3000/users
curl -X DELETE http://localhost:3000/users/<USER_ID>
```

### Step B5: stop services

```bash
docker compose down
```

Delete DB volume also (danger: data loss):

```bash
docker compose down -v
```

---

## 6) Networking explained simply

In Compose, app connects using:

`postgresql://postgres:postgres@postgres:5432/usersdb?schema=public`

Why host is `postgres`:

- `postgres` is service name in compose file.
- Docker gives DNS entry for service names in same network.

Important:

- `localhost` inside container means that same container only.

---

## 7) Volumes explained simply

DB writes files to `/var/lib/postgresql/data` in container.

Compose maps that path to named volume `pg-users-data`.

Result:

- restart/remove container -> data can still survive
- remove volume -> data gone

---

## 8) Prisma commands quick guide

- `bun run prisma:generate`
  - regenerate Prisma client.

- `bun run prisma:migrate`
  - dev migration command (create/apply migration in local development).

- `bunx prisma migrate deploy`
  - apply already existing migration files (used at startup in container).

- `bun run prisma:studio`
  - open Prisma Studio UI.

---

## 9) Useful debug commands

### Check containers

```bash
docker ps
docker compose ps
```

### Check logs

```bash
docker compose logs -f app
docker compose logs -f postgres
```

### Check DB table/data

```bash
docker exec -it pg-users psql -U postgres -d usersdb -c '\dt'
docker exec -it pg-users psql -U postgres -d usersdb -c 'SELECT * FROM "User";'
```

---

## 10) Common errors and fixes

- Error: `DATABASE_URL is required`
  - set `.env` for local run or env in container config.

- App cannot connect to DB
  - check DB container is running.
  - check hostname in URL:
    - local app: `localhost`
    - compose app: `postgres`

- `username already exists`
  - username is unique; use different value.

- Port already in use
  - free port `3000`/`5432` or change mapping.

---

## 11) Cleanup and reset

Stop and remove containers:

```bash
docker rm -f pg-users user-project-api 2>/dev/null || true
docker compose down 2>/dev/null || true
```

Remove DB volume (danger: delete data):

```bash
docker volume rm pg-users-data
```

Optional Docker cleanup:

```bash
docker system prune -f
```

---

## 12) One-command blocks (copy-paste)

### Local app + docker DB

```bash
cd 27-week-27/27.1-docker-compose-example
bun install
cp .env.example .env
docker rm -f pg-users 2>/dev/null || true
docker run -d --name pg-users -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=usersdb -p 5432:5432 -v pg-users-data:/var/lib/postgresql/data postgres:16-alpine
bun run prisma:generate
bun run prisma:migrate
bun run dev
```

### Full compose stack

```bash
cd 27-week-27/27.1-docker-compose-example
docker compose up --build -d
curl http://localhost:3000/health
```
