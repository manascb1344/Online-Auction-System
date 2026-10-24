# Setup Guide

This guide covers the Docker stack, local development, switching database engines, database lifecycle, and troubleshooting. For an overview of the project and its API, see [README.md](README.md).

## 1. Prerequisites

| Tool | Version | Needed for |
|------|---------|------------|
| Docker + Docker Compose | Compose v2 (`docker compose`) | Full stack and databases |
| GNU Make | 4.x | All shortcuts in the Makefile |
| Node.js | 20 or newer | Local API/client development |
| pnpm | 9 or newer (`corepack enable`) | Installing dependencies locally |

You do not need Node or pnpm to run the Docker stack; the images install their own dependencies.

## 2. Start the full stack

```bash
git clone https://github.com/manascb1344/Online-Auction-System.git
cd Online-Auction-System
make env
make up DB=mysql
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | React web client |
| http://localhost:4000/health | API health check |
| http://localhost:8080 | Adminer (start with `make adminer`) |

For PostgreSQL instead of MySQL:

```bash
make down
make up DB=postgres
```

PostgreSQL publishes on host port **5433** so it can coexist with a local PostgreSQL on 5432. Override with `POSTGRES_HOST_PORT` in `.env`.

`make up` builds both images, waits for the database health check, then waits for the API. The web container serves the built SPA and proxies `/api` to the API container, so the browser only talks to port 3000.

## 3. Demo accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123!` |
| Seller | `seller1`, `seller2`, `seller3` | `Seller123!` |
| Buyer | `buyer1`, `buyer2`, `buyer3`, `buyer4` | `Buyer123!` |

The seed also ships six lots in three auction states (active, scheduled, closed), five bids, and two settled transactions.

## 4. Local development (API and client on the host)

```bash
make install
make db-up DB=mysql
cp server/.env.example server/.env
```

Edit `server/.env` for the engine you started:

```dotenv
DB_CLIENT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=auction_user
DB_PASSWORD=auction_password
DB_NAME=auction_system
JWT_SECRET=local-dev-secret-please-change
```

Then run the two dev servers in separate terminals:

```bash
make dev-api       # node --watch src/server.js on :4000
make dev-client    # react-scripts start on :3000
```

The client reads `REACT_APP_API_URL` at build/start time. The default is `http://localhost:4000/api`; copy `client/.env.example` to `client/.env` if you need another host.

## 5. Environment files

There are two independent files:

| File | Read by | Purpose |
|------|---------|---------|
| `.env` (repo root) | Docker Compose | Ports, database credentials, `JWT_SECRET` for containers |
| `server/.env` | API process on the host | Database connection, JWT, CORS, bcrypt cost |
| `client/.env` | React dev server / build | `REACT_APP_API_URL` |

None of them are committed. `make env` copies the root example; the repository's `.gitignore` also blocks every `**/.env`.

`JWT_SECRET` must be unique outside local development. Production mode refuses to boot with the development fallback.

## 6. Database lifecycle

The schema and seed are applied by the official database images **only when the data volume is empty**.

```bash
make db-reset DB=mysql      # remove volumes, recreate, reload schema + seed
make db-reset DB=postgres
make db-shell DB=mysql      # mysql> prompt inside the container
make db-shell DB=postgres   # psql prompt inside the container
```

Manual equivalents:

```bash
docker compose -f docker-compose.yml -f docker/compose.mysql.yml down -v
docker compose -f docker-compose.yml -f docker/compose.mysql.yml up -d --wait db
```

To inspect data from the host with a local client:

```bash
mysql -h 127.0.0.1 -P 3306 -u auction_user -p auction_system
psql -h 127.0.0.1 -p 5433 -U auction_user -d auction_system
```

## 7. Tests

```bash
make test-mysql
make test-postgres
make test-all
```

Each target recreates the database volume (schema + seed), then runs the integration suite against the live API. The suite uses the seeded seller and admin accounts and creates uniquely named buyers, so it is safe to rerun.

The suite asserts: health/dialect reporting, registration and duplicate handling, login failures, role enforcement, lot creation, filtering and search, the bid minimum, the outbid transition, rejection of closed auctions, admin-only aggregates, and the structured 404 envelope.

## 8. Switching engines

The application never branches on the engine outside `server/src/db/dialects/` and the two schema folders. To switch:

```bash
make down
make db-up DB=postgres
# update server/.env if you run the API on the host
make dev-api
```

In Docker, `make up DB=postgres` performs the switch. The API reports the active engine at `GET /health` (`{"status":"ok","dialect":"postgres"}`).

## 9. Production notes

- Set a long, random `JWT_SECRET`; never reuse the example value.
- Replace the demo database credentials (`auction_user` / `auction_password`).
- Terminate TLS at a reverse proxy in front of the web container.
- The schema ships as initialization scripts, not migrations. For evolving deployments, introduce a migration tool and keep `server/src/queries/` as the single SQL source.
- Pin image tags (MySQL 8.0, PostgreSQL 16, nginx, node) in a deployment pipeline.
- Managed Postgres providers (Neon, Supabase, Render) work through either the discrete `DB_*` variables or a single `DATABASE_URL`; set `DB_SSL=true` when the provider requires TLS, then seed with `cd server && pnpm db:seed:hosted`.
- This repository's Render service builds `server/Dockerfile` with build context `server` and probes `/health`; the Vercel project uses Root Directory `client` and `client/vercel.json` rewrites `/api` to the hosted API.
- `.github/workflows/demo-topup.yml` keeps the hosted demo populated every 6 hours (and on manual dispatch) without deleting anything. Using the repository secret `DEMO_DATABASE_URL`, it adds new lots with fresh timestamps and a couple of seeded bids whenever fewer than four auctions are active; existing accounts, lots, and bids are preserved. Run it manually to top up immediately.
- A hosted API needs `CLIENT_ORIGIN` set to the deployed web origin so browser requests pass CORS; the Docker client image proxies `/api` and does not need it.

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `required variable JWT_SECRET is missing` | No `.env` at the repo root | `make env`, then set a real secret |
| Port 3306 / 5433 / 3000 / 4000 already in use | Another service owns the port | Change the port in `.env` (`MYSQL_HOST_PORT`, `POSTGRES_HOST_PORT`, `CLIENT_PORT`, `API_PORT`) |
| Schema changes do not appear | Init scripts only run on an empty volume | `make db-reset DB=<engine>` |
| `Cannot reach the API` in the browser | API container unhealthy or wrong `REACT_APP_API_URL` | `make ps` / `make logs`; rebuild the client if the URL changed |
| Login works, then requests return 401 | API restarted with a different `JWT_SECRET` | Sign in again; keep the secret stable |
| Tailwind classes have no effect | Missing PostCSS wiring | Ensure `client/postcss.config.js` exists and rebuild |
| `make up DB=...` says the DB must be mysql or postgres | Typo in `DB` | Use `DB=mysql` or `DB=postgres` |
