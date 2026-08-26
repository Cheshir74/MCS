# Kamal Deployment

Kamal is the primary Docker deployment path for this app. It builds the Rails
image, pushes it through a local registry on the server, runs the web container
behind kamal-proxy, and keeps PostgreSQL as a Kamal accessory.

The staging destination is configured in:

```text
config/deploy.yml
config/deploy.staging.yml
.kamal/secrets.staging
mise.toml
```

## First Deploy

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

Export the secrets used by `.kamal/secrets.staging`:

```bash
export DATABASE_PASSWORD="replace_with_strong_database_password"
export ENCRYPTION_KEY="replace_with_64_hex_characters_or_keep_it_in_credentials"
export MAILER_HOST="example.com"
```

`RAILS_MASTER_KEY` is read from `config/master.key` by `.kamal/secrets.staging`.
Do not commit `config/master.key`.

Validate the rendered Kamal config:

```bash
mise run kamal-check
```

Bootstrap the server, push env, boot PostgreSQL, and deploy:

```bash
mise run kamal-setup
```

## Regular Deploy

Use backward-compatible migrations where possible. For deploys that include DB
changes, run the migration explicitly, then deploy:

```bash
mise run kamal-migrate
mise run kamal-deploy
```

For code-only deploys:

```bash
mise run kamal-deploy
```

Useful commands:

```bash
mise run kamal-logs
bundle exec kamal app exec --interactive --reuse -d staging "bundle exec rails console"
bundle exec kamal app exec --interactive --reuse -d staging "bash"
bundle exec kamal rollback -d staging
```

## Server Layout

Kamal owns its runtime files under the default `.kamal` directory on the server.
Persistent application data is stored in Docker volumes/accessory directories:

```text
mcs_storage              -> /app/storage
mcs-postgres data volume -> /var/lib/postgresql/data
```

The Rails container exposes port `3000` internally. Kamal-proxy publishes the
app on ports `80` and `443`; staging currently has SSL disabled because the
configuration targets the raw server IP.

## Migrating Existing Server Data

1. Stop writes on the old app, or put the site in maintenance mode.
2. Dump the old PostgreSQL database:

   ```bash
   pg_dump -Fc -d MSC_production -f /tmp/mcs.dump
   ```

3. Copy the dump to the new server.
4. Boot the PostgreSQL accessory if it is not already running:

   ```bash
   bundle exec kamal accessory boot postgres -d staging
   ```

5. Restore into the accessory database:

   ```bash
   bundle exec kamal accessory exec postgres -d staging --reuse \
     'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/mcs.dump'
   ```

6. Copy Active Storage files from the old shared storage directory into the
   `mcs_storage` Docker volume.
7. Run migrations and deploy:

   ```bash
   mise run kamal-migrate
   mise run kamal-deploy
   ```

8. Check login, uploads, existing images/files, mail delivery, and admin flows.
