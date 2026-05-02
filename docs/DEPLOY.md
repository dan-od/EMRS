# EMRS Deployment Guide

## Overview

EMRS runs as four Docker containers behind a Cloudflare Tunnel:

| Container | Role |
|---|---|
| `emrs-postgres` | PostgreSQL 16 — persistent data volume |
| `emrs-backend` | Node/Express API on port 5000 |
| `emrs-frontend` | Vite build served by nginx |
| `emrs-nginx` | Reverse proxy — the only container on the `web` network |

Two Docker networks:
- `emrs-network` (internal) — all four containers communicate here
- `web` (external, pre-existing) — only `emrs-nginx` joins this so `cloudflared` can reach it

No host ports are exposed. All public traffic enters via Cloudflare Tunnel → `emrs-nginx`.

---

## First-Time Deploy (manual)

### Prerequisites
- SSH access to the Debian VM at `192.168.10.222`
- Docker running on the host with the `web` network already present
- A GitHub repo with this code
- A Cloudflare Zero Trust account with a configured tunnel (tunnel itself needs no changes)

### Steps

**1. SSH to the homelab**
```bash
ssh <user>@192.168.10.222
```

**2. Clone the repo**
```bash
cd /opt
git clone <repo-url> emrs
cd emrs
```

**3. Create and fill the `.env` file**
```bash
cp .env.example .env
nano .env
```

Fill in every `REQUIRED` variable. Generate secrets with:
```bash
openssl rand -base64 24   # for DB_PASSWORD
openssl rand -hex 64      # for JWT_SECRET and JWT_REFRESH_SECRET
```

**4. Run pre-flight checks**
```bash
# Confirm target directory is correct
ls /opt/emrs && echo "OK"

# Confirm no container name collisions
docker ps -a --format '{{.Names}}' | grep -E '^emrs-' && echo "COLLISION — investigate" || echo "OK"

# Confirm web network exists
docker network inspect web > /dev/null && echo "web network OK" || echo "MISSING — check homelab"

# Confirm no volume collision
docker volume ls | grep emrs_postgres_data && echo "COLLISION" || echo "OK"
```

**5. Start the stack**
```bash
docker compose up -d
```

**6. Confirm migrations ran**
```bash
docker compose logs emrs-backend | grep -E "migration|Migration"
# Expect: "Applied 001_init.sql" on first boot, or "All migrations already up to date"
```

**7. Run the database seed (first boot only — do not repeat)**
```bash
docker exec emrs-backend npm run seed
```

Make note of the seed credentials output — you'll need them for the first login.

**8. Add the Cloudflare Zero Trust route**

In the Cloudflare dashboard → Zero Trust → Networks → Tunnels → your tunnel → Public Hostnames:
- **Subdomain:** `emrs`
- **Domain:** `okoro.me`
- **Service type:** HTTP
- **URL:** `emrs-nginx:80`

**9. Verify**
```bash
# Container health
docker compose ps

# Internal routing from cloudflared's perspective
docker exec cloudflared wget -qO- http://emrs-nginx/ | head -5

# Public URL (after DNS propagates)
curl -I https://emrs.okoro.me
```

---

## Subsequent Deploys

Automatic — GitHub Actions deploys on every push to `main`.

The workflow:
1. SSHs to the homelab
2. `git reset --hard origin/main`
3. `docker compose build`
4. `docker compose up -d`

Migrations run automatically on backend container start (`npm run migrate && node server.js`). The runner is idempotent — already-applied migrations are skipped.

> **Note:** `cancel-in-progress: false` in the workflow means rapid pushes queue rather than cancel. This prevents a deploy from being interrupted mid-flight.

---

## Common Operations

**View logs**
```bash
docker compose logs -f emrs-backend
docker compose logs -f emrs-nginx
docker compose logs --tail=100 emrs-postgres
```

**Database shell**
```bash
docker exec -it emrs-postgres psql -U emrs_admin -d emrs_wellfluid
```

**Database backup**
```bash
docker exec emrs-postgres pg_dump -U emrs_admin emrs_wellfluid \
  > /opt/emrs/backup_$(date +%Y%m%d_%H%M%S).sql
```

**Rebuild after code change (manual)**
```bash
cd /opt/emrs
git pull
docker compose build
docker compose up -d
```

**Restart a single service**
```bash
docker compose restart emrs-backend
```

**Check container resource usage**
```bash
docker stats emrs-postgres emrs-backend emrs-frontend emrs-nginx
```

---

## Restore from Backup

```bash
# 1. Stop the stack (keeps the postgres container available)
docker compose stop emrs-backend emrs-frontend emrs-nginx

# 2. Restore the dump
cat /path/to/backup.sql | docker exec -i emrs-postgres \
  psql -U emrs_admin -d emrs_wellfluid

# 3. Restart
docker compose up -d
```

---

## Reset Database (destructive)

Wipes all data and re-runs migrations from scratch. Use only in emergencies.

```bash
docker compose down -v          # removes containers AND the named volume
docker compose up -d            # fresh postgres, migrations re-run on backend start
docker exec emrs-backend npm run seed   # re-seed
```

---

## Troubleshooting

### Container won't start

```bash
docker compose logs emrs-backend
docker compose logs emrs-postgres
```

Common causes:
- `DB_PASSWORD` or `JWT_SECRET` missing from `.env` — the backend throws on startup in production if these are absent
- `emrs-postgres` not yet healthy when backend starts — wait 15s and try `docker compose up -d` again (postgres healthcheck prevents this under normal conditions)

### Migrations fail

```bash
docker compose logs emrs-backend | grep -i "migrat"
```

- If `relation "migrations" does not exist` — DB not ready yet, restart backend
- If a SQL syntax error — check the migration file, fix, then `docker compose restart emrs-backend`

### 502 Bad Gateway from Cloudflare

Cloudflare reached `emrs-nginx` but nginx got a bad response upstream.

```bash
# Check if backend is up and healthy
docker compose ps
docker compose logs emrs-nginx

# Test internal routing manually
docker exec emrs-nginx wget -qO- http://emrs-backend:5000/api/health
docker exec emrs-nginx wget -qO- http://emrs-frontend:80/
```

### Cloudflare 1033 / "Tunnel not found"

Cloudflare can't reach the tunnel at all. Check:
```bash
docker ps | grep cloudflared
docker logs cloudflared --tail=50
```

If `cloudflared` is up but the error persists, verify the public hostname route in Zero Trust points to `http://emrs-nginx:80` (not HTTPS, not a different port).

---

## Known Limitations (first deploy)

- **Email** — Password reset and email notifications are non-functional until `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env` and `docker compose up -d` is re-run.
- **SMS** — Termii notifications are disabled (`SMS_ENABLED=false`). Set `SMS_ENABLED=true` and provide `TERMII_API_KEY` to enable.
- **Error tracking** — Sentry is inactive until `SENTRY_DSN` / `VITE_SENTRY_DSN` are set (requires a frontend rebuild for `VITE_SENTRY_DSN`).
