# Online Auction System

A reference-quality, SQL-first auction platform for coursework and self-study. Buyers bid on timed lots, sellers publish auctions, and administrators inspect every auction, bid, and settlement. The same application runs on **MySQL 8.0** or **PostgreSQL 16** with **one source of SQL** for both engines.

## Highlights

- **Dual database, one query source.** Every application query lives in `server/src/queries/` and is written with named parameters (`:name`). A small compiler emits `?` for mysql2 or `$1` for node-postgres, so no query is duplicated per engine.
- **Transactional bidding.** Bid placement locks the auction row (`SELECT ... FOR UPDATE`), validates status, end time, reserve price, and minimum increment, then writes the bid and marks the previous winner `outbid` in one transaction.
- **Real authentication.** bcrypt password hashes, JWT bearer tokens, role guards (`buyer`, `seller`, `admin`), and per-route request validation with Zod.
- **Enforced schema.** Table-level foreign keys, `CHECK` constraints, unique keys, and secondary indexes on both engines. Primary keys are application-generated UUIDs, which removes `MAX(id) + 1` races and keeps inserts portable.
- **Dockerized stack.** API, web client, and database run through Compose profiles/overrides; the web container serves the SPA and proxies `/api` to the API container.
- **Tested both ways.** The same integration suite runs against live MySQL and PostgreSQL containers, covering happy paths, role violations, invalid bids, and closed auctions.

## Architecture

```text
Browser
  │  React 18 + React Router + Tailwind
  │  Authorization: Bearer <JWT>
  ▼
Express API (Node 20+)
  │  routers → controllers → db facade → named-parameter compiler
  │  Zod validation · helmet · CORS · structured errors
  ▼
MySQL 8.0  or  PostgreSQL 16
```

The API and client are stateless; the database is the only stateful component. Both database engines use the same table and column names (lowercase, unquoted), so the shared SQL runs unchanged.

## Tech stack

| Layer | Choice |
|-------|--------|
| Web client | React 18, React Router 6, Tailwind CSS 3, `react-icons` |
| API | Node.js 20+, Express 4, Zod, helmet, CORS |
| Auth | bcryptjs hashes, JSON Web Tokens |
| Data access | Raw SQL (`mysql2` / `pg`) behind one adapter interface |
| Databases | MySQL 8.0, PostgreSQL 16 |
| Packaging | Docker, Docker Compose, Make |
| Tests | Node's built-in `node:test` + Supertest |

## Quick start (Docker)

```bash
git clone https://github.com/manascb1344/Online-Auction-System.git
cd Online-Auction-System
make env                     # creates .env from .env.example
make up DB=mysql             # http://localhost:3000
```

For PostgreSQL:

```bash
make up DB=postgres          # http://localhost:3000, database on host port 5433
```

Stop the stack with `make down`; wipe data and reload the seed with `make db-reset DB=mysql` (or `DB=postgres`).

Demo accounts (seeded in both engines):

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123!` |
| Seller | `seller1` / `seller2` / `seller3` | `Seller123!` |
| Buyer | `buyer1` … `buyer4` | `Buyer123!` |

## Local development (without app containers)

```bash
make install                 # server + client dependencies
make db-up DB=mysql          # database only, published on localhost:3306
make dev-api                 # API on :4000 (node --watch)
make dev-client              # React dev server on :3000
```

Use `DB=postgres` to develop against PostgreSQL (host port `5433`). The API reads `server/.env`; copy `server/.env.example` and set `DB_CLIENT`, `DB_PORT`, and `JWT_SECRET`.

## API reference

All responses use `{ "data": ... }` on success and `{ "error": { "code", "message", "details?" } }` on failure.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/health` | public | Liveness + active dialect |
| `POST` | `/api/auth/register` | public | Create a buyer or seller |
| `POST` | `/api/auth/login` | public | Obtain a JWT for a role |
| `GET` | `/api/auth/me` | any | Current account profile |
| `GET` | `/api/items` | public | Active lots; `status`, `search`, `page`, `limit` |
| `GET` | `/api/items/:id` | public | Lot detail with auction state |
| `POST` | `/api/items` | seller | Create a lot and its auction |
| `GET` | `/api/items/mine` | seller | Lots owned by the caller |
| `GET` | `/api/items/:id/bids` | public | Bid history (highest first) |
| `POST` | `/api/items/:id/bids` | buyer | Place a bid |
| `GET` | `/api/sellers/:sellerId/items` | public | Public seller inventory |
| `GET` | `/api/me/bids` | buyer | Caller's bids |
| `GET` | `/api/me/transactions` | buyer | Caller's settled purchases |
| `GET` | `/api/admin/stats` | admin | Aggregate counts |
| `GET` | `/api/admin/auctions` | admin | Every auction |
| `GET` | `/api/admin/bids` | admin | Every bid (paginated) |
| `GET` | `/api/admin/transactions` | admin | Every settlement |

Bid rules enforced by the API: the auction must be `active` and not past `end_time`; the first bid must meet `max(starting_price, reserve_price)`; later bids must beat the current highest bid by at least `1.00`.

## Database design

| Table | Purpose | Key constraints |
|-------|---------|-----------------|
| `buyers`, `sellers` | Account rows per role | Unique username/email, non-negative balance |
| `admins` | Back-office accounts | Unique username |
| `items` | Lots for sale | Seller FK, non-negative starting price |
| `auctions` | One auction per lot | Unique item FK, valid window, status check |
| `bids` | Bid history | Item/bidder FKs, positive amount, status check |
| `transactions` | Settled sales | One per item, buyer/seller FKs, amount check |

`server/src/queries/items.js` derives the current bid and bid count with correlated subqueries, so `items` never carries stale denormalized bid data. Auction status is derived from `start_time`/`end_time` in the shared SQL (the stored `auctions.status` column is a cache refreshed when a bid lands), so a scheduled auction becomes biddable as soon as its window opens without needing a background job. All money is `DECIMAL(12,2)` / `NUMERIC(12,2)`.

Dialect-specific definitions live in `database/mysql/` and `database/postgres/`; they differ only in storage types (`CHAR(36)` vs `UUID`, `DATETIME` vs `TIMESTAMPTZ`) and table options. See [`database/README.md`](database/README.md).

## Testing

```bash
make test-mysql       # reset MySQL volume, load seed, run the API suite
make test-postgres    # same suite against PostgreSQL
make test-all         # both engines
```

The suite covers registration and duplicate handling, login failures, role enforcement, lot creation, filtering/search, bid increments, the outbid transition, closed-auction rejection, admin-only views, and the 404 envelope.

## Hosted demo top-up

`.github/workflows/demo-topup.yml` runs every 6 hours on a [PreciseActions](https://preciseactions.zephop.com) schedule (GitHub's own cron is intentionally absent so the job does not double-run) and on manual dispatch. It targets the **hosted PostgreSQL demo only**. It never deletes rows: when fewer than four auctions are active it creates new lots as the seeded sellers, gives each a couple of bids from the seeded buyers, and leaves existing accounts, lots, and bids untouched. Each lot's name, description, category, and price are generated with Faker, so there is no catalogue list to maintain; manual dispatch accepts a `min_active` input to raise the floor. The script refuses non-public hosts and requires the repository secret `DEMO_DATABASE_URL`.

## Makefile

| Command | Effect |
|---------|--------|
| `make help` | List targets (shows the selected `DB`) |
| `make env` | Create `.env` from `.env.example` if missing |
| `make install` | Install server and client dependencies |
| `make up DB=mysql` | Build and start the full stack |
| `make down` | Stop containers, keep volumes |
| `make db-up DB=postgres` | Start only the database |
| `make db-reset DB=mysql` | Drop and recreate the volume, reload schema + seed |
| `make db-shell DB=postgres` | Open `psql`/`mysql` inside the database container |
| `make test-mysql` / `make test-postgres` | Integration suite for one engine |
| `ALLOW_DEMO_TOPUP=true DEMO_DATABASE_URL=… pnpm db:demo-topup` (in `server/`) | Add demo listings to the hosted database when active auctions run low |
| `make logs` / `make ps` | Container logs / status |
| `make clean` | Remove containers and volumes |

## Project structure

```text
.
├── client/                 # React SPA (CRA 5)
│   ├── src/
│   │   ├── api/            # fetch client + useApi hook
│   │   ├── auth/           # session storage + auth context
│   │   ├── components/     # layout and shared UI
│   │   └── pages/          # routed screens
│   ├── Dockerfile          # multi-stage build → nginx
│   └── nginx.conf          # SPA fallback + /api proxy
├── server/
│   ├── src/
│   │   ├── config/         # validated environment
│   │   ├── db/             # compiler, adapters, facade
│   │   ├── queries/        # THE single source of SQL
│   │   ├── controllers/    # HTTP handlers only
│   │   ├── routes/         # endpoint wiring + guards
│   │   ├── middleware/     # auth, validation, errors
│   │   └── validation/     # Zod schemas
│   ├── test/               # integration suite
│   └── Dockerfile
├── database/
│   ├── mysql/              # schema + seed
│   └── postgres/           # schema + seed
├── docker/                 # per-engine Compose overrides
├── docker-compose.yml      # API + client + Adminer (base)
├── Makefile
├── SETUP.md
└── .env.example
```

## Environment variables

| Variable | Default | Notes |
|----------|---------|-------|
| `DB_CLIENT` | `mysql` | `mysql` or `postgres` |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / engine default | In Compose the host is `db` |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `auction_user` / `auction_password` / `auction_system` | Shared by both engines |
| `DATABASE_URL` | unset | Optional single Postgres URL; overrides the `DB_*` fields and selects Postgres unless `DB_CLIENT` is set |
| `DB_SSL` | `false` | `true` for managed Postgres that requires TLS (Neon, Supabase, Render) |
| `JWT_SECRET` | dev fallback only | Required and enforced in production |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `CLIENT_ORIGIN` | `http://localhost:3000` | CORS allowlist (comma separated) |
| `BCRYPT_ROUNDS` | `10` | Password hashing cost |
| `REACT_APP_API_URL` | `http://localhost:4000/api` | Client build-time API base (`/api` in Docker) |

## Troubleshooting

- **Port 5432 is busy.** The Postgres container publishes on `5433` by default; change `POSTGRES_HOST_PORT` in `.env` if needed.
- **Schema changes do not appear.** Init scripts run only on an empty volume; use `make db-reset DB=<engine>`.
- **Login fails after changing `.env`.** JWTs are signed with `JWT_SECRET`; restart the API and sign in again.
- **`make up` refuses to start.** `JWT_SECRET` is required by Compose; run `make env` and replace the placeholder.
- **Tailwind classes have no effect.** Ensure `client/postcss.config.js` exists; it is what wires Tailwind into CRA's PostCSS pipeline.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `make test-all` before opening a pull request; never commit `.env` files or database volumes.
