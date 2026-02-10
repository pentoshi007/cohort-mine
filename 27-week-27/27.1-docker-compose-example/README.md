# 27.1 Docker Compose Example (Bun + Prisma + Postgres)

This README is a full start-to-end execution guide for this project, including:

- theory context (what/why)
- complete setup commands
- Prisma lifecycle commands
- API testing commands
- Docker and Compose operations

---

## 1) What this project is

This project is a simple Users API:

- Runtime: Bun + Express
- ORM: Prisma 7
- DB: PostgreSQL
- Containerization: Docker + Docker Compose

It exposes:

- `GET /health`
- `GET /users`
- `POST /users`
- `DELETE /users/:id`

---

## 2) Project file map (Docker-relevant)

- `DockerFile`: builds app image and runs `prisma migrate deploy` at startup.
- `docker-compose.yml`: runs `postgres` + `app` together with healthcheck dependency.
- `.env.example`: local-run env template (`DATABASE_URL`, `PORT`).
- `prisma.config.ts`: Prisma config, datasource URL is read from env.
- `prisma/schema.prisma`: Prisma model definition (`User` table).
- `prisma/migrations/*`: versioned SQL migrations (source of truth for deploy).
- `src/index.ts`: API server, Prisma client/adapter wiring, endpoints.
- `package.json`: scripts for local run and Prisma commands.

---

## 3) Prerequisites

Install:

- Docker Desktop (Compose plugin included)
- Bun

Verify:

```bash
docker --version
docker compose version
bun --version
```

---

## 4) Workflow A: Local app + Postgres in Docker (step-by-step)

Use this when learning/debugging and you want Bun app on host.

### Step A1: Go to project folder

```bash
cd 27-week-27/27.1-docker-compose-example
```

### Step A2: Install dependencies

```bash
bun install
```

### Step A3: Setup env file

```bash
cp .env.example .env
```

Default `.env` values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/usersdb?schema=public"
PORT=3000
```

### Step A4: Start Postgres container

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

Why this command matters:

- creates DB `usersdb`
- exposes DB on host `localhost:5432`
- persists data via volume `pg-users-data`

### Step A5: Prisma generate + migrate

```bash
bun run prisma:generate
bun run prisma:migrate
```

What happens:

- Prisma client is generated for app usage.
- Initial migration creates table `User` and unique index on `username`.

### Step A6: Start API locally

```bash
bun run dev
```

Expected startup:

- API running at `http://localhost:3000`

### Step A7: Test APIs

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"username":"aniket"}'
curl http://localhost:3000/users
curl -X DELETE http://localhost:3000/users/<USER_ID>
```

---

## 5) Workflow B: Full stack with Docker Compose (recommended daily run)

Use this when you want app + DB both containerized.

### Step B1: Go to project folder

```bash
cd 27-week-27/27.1-docker-compose-example
```

### Step B2: Start stack

```bash
docker compose up --build -d
```

What Compose does here:

- starts `postgres` service with persistent volume
- builds app image from `DockerFile`
- waits for DB healthcheck
- starts app service with:
  - `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/usersdb?schema=public`
  - `PORT=3000`
- runs `prisma migrate deploy` in app container startup command

### Step B3: Verify services

```bash
docker compose ps
docker compose logs -f
```

### Step B4: Test APIs

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"username":"aniket"}'
curl http://localhost:3000/users
curl -X DELETE http://localhost:3000/users/<USER_ID>
```

### Step B5: Stop stack

```bash
docker compose down
```

Keep DB data (default): yes  
Delete DB data too:

```bash
docker compose down -v
```

---

## 6) Prisma command guide (what to use when)

- `bun run prisma:generate`
  - regenerate Prisma client after schema changes.
- `bun run prisma:migrate` (`prisma migrate dev --name init`)
  - local development migration creation/apply flow.
- `bunx prisma migrate deploy`
  - apply existing migration files in container/deploy environments.
- `bun run prisma:studio`
  - open Prisma Studio for DB browsing.

Important:

- local development uses `migrate dev`.
- container startup uses `migrate deploy`.

---

## 7) Docker operations for this project

### Rebuild app image manually

```bash
docker build -f DockerFile -t user-project:test .
```

### Run app image manually (when DB runs on host-mapped port)

```bash
docker run -d \
  --name user-project-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/usersdb?schema=public" \
  -e PORT=3000 \
  user-project:test
```

### Inspect DB from container

```bash
docker exec -it pg-users psql -U postgres -d usersdb -c '\dt'
docker exec -it pg-users psql -U postgres -d usersdb -c 'SELECT * FROM "User";'
```

### Useful logs

```bash
docker logs -f user-project-api
docker compose logs -f app
docker compose logs -f postgres
```

---

## 8) Troubleshooting

- `DATABASE_URL is required`:
  - set `.env` for local run, or pass env in `docker run`, or use compose env.
- App cannot connect to DB:
  - confirm postgres is running and healthy.
  - confirm host in URL (`localhost` for host app, `postgres` for compose app).
- `username already exists` on POST:
  - `username` has unique index; use a new value.
- `user not found` on DELETE:
  - confirm `id` from `GET /users`.
- Port in use (`3000` or `5432`):
  - stop conflicting process/container or map different host port.

---

## 9) Full cleanup/reset commands

Stop and remove containers:

```bash
docker rm -f user-project-api pg-users 2>/dev/null || true
docker compose down 2>/dev/null || true
```

Delete persistent DB volume (destructive):

```bash
docker volume rm pg-users-data
```

System cleanup (optional):

```bash
docker system prune -f
```

---

## 10) One-shot quick start blocks

### Local app + Docker DB quick start

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

### Compose quick start

```bash
cd 27-week-27/27.1-docker-compose-example
docker compose up --build -d
curl http://localhost:3000/health
```
# 27.1 Docker + Prisma + Postgres (No Compose)

Uses latest Prisma (v7) setup.

- `prisma.config.ts` holds datasource URL
- `schema.prisma` keeps only datasource provider (no `url = env(...)`)
- App uses `@prisma/adapter-pg` + `pg` with `PrismaClient({ adapter })`

## 1) Start Postgres with Docker

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

## 2) Install deps and env

```bash
bun install
cp .env.example .env
```

## 3) Prisma setup

```bash
bun run prisma:generate
bun run prisma:migrate
```

## 4) Run API

```bash
bun run dev
```

API: `http://localhost:3000`
