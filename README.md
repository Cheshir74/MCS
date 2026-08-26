# MCS

Rails-приложение на Ruby 3.4.8, PostgreSQL, Puma и Active Storage.

## Локальный Запуск

1. Установить зависимости:

   ```bash
   bundle install
   node .yarn/releases/yarn-4.18.0.cjs install --immutable
   ```

2. Подготовить БД:

   ```bash
   cp config/database.yml.example config/database.yml
   bin/rails db:create
   bin/rails db:migrate
   ```

3. Собрать frontend:

   ```bash
   node .yarn/releases/yarn-4.18.0.cjs run build
   ```

4. Запустить приложение:

   ```bash
   bin/dev
   ```

## Тесты

```bash
bundle exec rspec
```

В GitHub Actions тесты запускаются перед сборкой Docker image.

## Production-Секреты

Не коммитить:

- `config/master.key`
- `config/database.yml`
- `.env.production`
- `storage`
- PostgreSQL dump-файлы

Для production нужны:

- `RAILS_MASTER_KEY`
- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `MAILER_HOST`
- `ENCRYPTION_KEY` или `encryption_key` в Rails credentials

## Деплой Через Kamal

Основной Docker-деплой теперь идет через Kamal:

```bash
mise install
bundle install
mise trust
mise run kamal-check
mise run kamal-setup
```

Повторный деплой:

```bash
mise run kamal-deploy
```

Если в релизе есть миграции:

```bash
mise run kamal-migrate
mise run kamal-deploy
```

Staging-конфиги:

```text
config/deploy.yml
config/deploy.staging.yml
.kamal/secrets.staging
mise.toml
```

Перед деплоем нужны локальные env-переменные:

```bash
export DATABASE_PASSWORD="replace_with_strong_database_password"
export ENCRYPTION_KEY="replace_with_64_hex_characters_or_keep_it_in_credentials"
export MAILER_HOST="example.com"
```

`RAILS_MASTER_KEY` читается из `config/master.key`.

Подробная инструкция: [DEPLOY_DOCKER.md](DEPLOY_DOCKER.md).

Файлы Active Storage хранятся вне app-контейнера:

```text
mcs_storage Docker volume
```

PostgreSQL data хранится в accessory volume:

```text
mcs-postgres:/var/lib/postgresql/data
```

## Docker Image Из GitHub

Workflow:

```text
.github/workflows/ci-image.yml
```

Он запускает RSpec, собирает Docker image и публикует его в GHCR.

Чтобы сервер тянул готовый image, в `.env.production`:

```text
DEPLOY_FROM_REGISTRY=true
WEB_IMAGE=ghcr.io/cheshir74/mcs:latest
```
