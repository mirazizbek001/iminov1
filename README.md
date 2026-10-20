# CyberKid — Railway single-service deployment

This repository root is the **whole project**. Deploy this root with Railway's Dockerfile builder.

## Structure
- `Dockerfile` — builds React and runs Django + Nginx in one service
- `backend/` — Django API, auth, sessions and database models
- `frontend/react/` — React application
- `railway/` — Nginx and startup configuration
- `railway.toml` — Railway deployment configuration

## Railway
1. Deploy the repository **root** (do not deploy only `frontend/react`).
2. Add a Railway PostgreSQL database and link its `DATABASE_URL` to the web service (recommended).
3. Or add a Railway Volume mounted at `/data` for persistent SQLite storage.
4. Set `SECRET_KEY` to a long random value.
5. Open `/health` after deployment.

Railway production requires PostgreSQL or a Volume mounted at `/data`. If neither is configured, or the configured `DATABASE_URL` is not reachable at startup, the container intentionally stops with an error rather than silently using temporary SQLite and risking data loss. Link the PostgreSQL service's `DATABASE_URL` to the web service in Railway Variables, or attach a persistent Volume at `/data`.

For real persistence, attach PostgreSQL or a Railway Volume; do not commit `backend/db.sqlite3` to production storage.
