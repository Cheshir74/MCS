# Docker Deployment

This Docker setup runs Rails/Puma in one container and PostgreSQL in a separate
container. Uploaded files are stored outside the app container in
`./data/storage`, so rebuilding or replacing the app image does not remove
Active Storage files.

## Short Version

First deploy:

```bash
bin/docker-setup
```

Then edit `.env.production` and run:

```bash
bin/docker-deploy
```

Regular deploy after code changes:

```bash
git pull
bin/docker-deploy
```

Backup:

```bash
bin/docker-backup
```

## Build In GitHub

The repository has a GitHub Actions workflow at:

```text
.github/workflows/ci-image.yml
```

On `push` to `main` or `new_version_design` it runs specs first, then builds and
pushes the Docker image to GitHub Container Registry:

```text
ghcr.io/<owner>/<repo>:<commit-sha>
ghcr.io/<owner>/<repo>:latest
```

To deploy the prebuilt image from GHCR, set this on the server in
`.env.production`:

```text
DEPLOY_FROM_REGISTRY=true
WEB_IMAGE=ghcr.io/cheshir74/mcs:latest
```

If the GHCR package is private, log in on the server once:

```bash
echo "<github-token-with-read-packages>" | docker login ghcr.io -u "<github-username>" --password-stdin
```

Then deploy with the same command:

```bash
bin/docker-deploy
```

For a pinned deploy, use the commit SHA tag instead of `latest`:

```text
WEB_IMAGE=ghcr.io/cheshir74/mcs:<commit-sha>
```

## Server Layout

Use this layout on the production server:

```text
/srv/mcs/
  compose.production.yml
  .env.production
  data/
    postgres/
    storage/
  secrets/
    credentials.yml.enc
  backups/
```

`data/postgres` and `data/storage` are persistent data. Back them up regularly.

## Required Secrets

`bin/docker-setup` creates `.env.production` from `.env.production.example`.
Fill in real values before deploy.

The app also needs encrypted Rails credentials at runtime. `bin/docker-setup`
copies `config/credentials.yml.enc` to:

```text
./secrets/credentials.yml.enc -> /app/config/credentials.yml.enc
```

The decrypt key must be provided as `RAILS_MASTER_KEY` in `.env.production`.

## Build And Boot

Use the wrapper script:

```bash
bin/docker-deploy
```

It builds the image, starts PostgreSQL, runs migrations, starts Rails, and prints
container status.

The Rails container listens on `127.0.0.1:3000`. Put Nginx or Caddy in front of
it for TLS and public traffic.

## Migrating From The Current Server

1. Stop writes on the old app, or put the site in maintenance mode.
2. Dump the old PostgreSQL database:

   ```bash
   pg_dump -Fc -d MSC_production -f /srv/mcs/backups/mcs.dump
   ```

3. Restore into the Docker PostgreSQL container:

   ```bash
   docker compose -f compose.production.yml up -d postgres
   docker compose -f compose.production.yml exec -T postgres sh -c \
     'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
     < /srv/mcs/backups/mcs.dump
   ```

4. Copy Active Storage files from the old shared storage directory:

   ```bash
   rsync -a /home/depus/app_deploy/shared/storage/ /srv/mcs/data/storage/
   ```

5. Run migrations and boot the app:

   ```bash
   bin/docker-deploy
   ```

6. Check login, uploads, existing images/files, mail delivery, and admin flows.

## Backups

Back up both PostgreSQL and Active Storage:

```bash
bin/docker-backup
```

## Moving Files Later

This setup keeps files portable because Active Storage files live in
`data/storage`, not inside the container. For stronger portability, move Active
Storage to an S3-compatible service later and change `config.active_storage.service`
from `:local` to that remote service.
