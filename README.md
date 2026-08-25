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

## Деплой Через Capistrano

Текущий Capistrano stage:

```text
config/deploy/staging.rb
```

Деплой:

```bash
bundle exec cap staging deploy
```

Capistrano использует shared-файлы и директории на сервере:

```text
/home/depus/app_deploy/shared/config/database.yml
/home/depus/app_deploy/shared/config/master.key
/home/depus/app_deploy/shared/config/credentials.yml.enc
/home/depus/app_deploy/shared/storage
```

## Деплой Через Docker

Подробная инструкция: [DEPLOY_DOCKER.md](DEPLOY_DOCKER.md).

Первичная подготовка:

```bash
bin/docker-setup
```

После заполнения `.env.production`:

```bash
bin/docker-deploy
```

Бэкап:

```bash
bin/docker-backup
```

Файлы Active Storage хранятся вне app-контейнера:

```text
data/storage
```

PostgreSQL data хранится отдельно:

```text
data/postgres
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
