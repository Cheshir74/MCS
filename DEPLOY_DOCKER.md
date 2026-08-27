# Kamal Deployment

Kamal is the primary Docker deployment path for this app. GitHub Actions builds
and publishes the Rails image to GHCR, Kamal pulls that image on the server,
runs the web container behind kamal-proxy, and keeps PostgreSQL as a Kamal
accessory.

Production deploys use service `msc_tda`. Staging deploys use service `mcs`.

Shared config:

```text
config/deploy.yml
mise.toml
```

Production config:

```text
config/deploy.production.yml
.kamal/secrets.production
.kamal/deploy.production.local
```

Staging config:

```text
config/deploy.staging.yml
.kamal/secrets.staging
```

## First Production Deploy

Install project tools and dependencies:

```bash
mise install
bundle install
node .yarn/releases/yarn-4.18.0.cjs install --immutable
```

Trust the project `mise.toml` once:

```bash
mise trust
```

Make sure the image for the commit exists in GHCR. Push to `master` and wait
for the `CI Image` GitHub Actions workflow to finish successfully.

```bash
git push origin master
```

Run the first deploy:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-first-deploy
```

The first-deploy script:

- verifies SSH key access;
- creates `.kamal/deploy.production.local` if needed;
- generates `.kamal/secrets.production.local`;
- creates `/home/depus/msc_tda/postgres/data`;
- creates `/home/depus/msc_tda/storage`;
- creates `/home/depus/msc_tda/backups`;
- runs Kamal setup with `--skip-push`;
- runs `rails db:prepare`;
- creates the first superadmin;
- prints the first admin credentials once at the end of the deploy log.

The first admin password is not written to the deploy files. If the account
already exists, the password is not changed or printed.

## Production SSL

Kamal-proxy provides automatic HTTPS via Let's Encrypt when `proxy.ssl` is
enabled. It also handles certificate renewal; do not run a separate certbot
container for this app.

Requirements:

- deploy to a single production server;
- point the public domain A record to `89.22.234.238`;
- keep ports `80` and `443` open to the server;
- set `PRODUCTION_APP_HOST` to the domain, not to the IP address.

Example `.kamal/deploy.production.local` values:

```text
PRODUCTION_HOST=89.22.234.238
PRODUCTION_APP_HOST=example.com
PRODUCTION_SSL=true
PRODUCTION_FORCE_SSL=true
```

Apply SSL after DNS is ready:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-enable-ssl
```

For one-off checks without editing the local config:

```bash
PRODUCTION_APP_HOST=example.com \
PRODUCTION_SSL=true \
PRODUCTION_FORCE_SSL=true \
KAMAL_VERSION=$(git rev-parse HEAD) \
mise run kamal-production-enable-ssl
```

## Regular Production Deploy

For normal deploys:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-deploy
```

Useful production commands:

```bash
mise run kamal-production-check
mise run kamal-production-logs
mise run kamal-production-migrate
```

## Staging Deploy

First staging deploy:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-first-deploy
```

Regular staging deploy:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-deploy
```

Useful staging commands:

```bash
mise run kamal-check
mise run kamal-logs
mise run kamal-migrate
```

## Server Layout

Production persistent data:

```text
/home/depus/msc_tda/postgres/data  -> PostgreSQL data directory
/home/depus/msc_tda/storage        -> Rails Active Storage uploads
/home/depus/msc_tda/backups        -> backup files
```

Staging persistent data:

```text
/home/depus/mcs/postgres/data      -> PostgreSQL data directory
/home/depus/mcs/storage            -> Rails Active Storage uploads
/home/depus/mcs/backups            -> backup files
```

The Rails container exposes port `3000` internally. Kamal-proxy publishes the
app on ports `80` and `443`.

## Backup

Create a production database dump:

```bash
ssh depus@89.22.234.238 \
  "docker exec msc-tda-postgres pg_dump -U msc_tda msc_tda_production" \
  > msc_tda_production.sql
```

Archive production uploads:

```bash
ssh depus@89.22.234.238 \
  "tar -czf /home/depus/msc_tda/backups/storage.tar.gz -C /home/depus/msc_tda/storage ."
scp depus@89.22.234.238:/home/depus/msc_tda/backups/storage.tar.gz .
```

## Migrating To Another Server

1. Stop writes on the old app, or put the site in maintenance mode.
2. Copy these local deploy files to the new machine:

   ```text
   config/master.key
   .kamal/secrets.production.local
   .kamal/deploy.production.local
   ```

3. Copy or restore database data from:

   ```text
   /home/depus/msc_tda/postgres/data
   ```

   Prefer a `pg_dump`/restore for a live production database.

4. Copy uploaded files from:

   ```text
   /home/depus/msc_tda/storage
   ```

5. Deploy the same image version on the new server:

   ```bash
   KAMAL_VERSION=<git-sha> mise run kamal-production-first-deploy
   ```

6. Check login, uploads, existing images/files, mail delivery, and admin flows.

## Legacy Staging Commands

The generic staging aliases are:

```bash
mise run kamal-first-deploy
mise run kamal-deploy
mise run kamal-logs
```
