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
- `.kamal/*.local`
- `storage`
- PostgreSQL dump-файлы

Kamal-секреты генерируются локально первым деплоем в ignored-файл
`.kamal/secrets.production.local`:

- `RAILS_MASTER_KEY`
- `DATABASE_PASSWORD`
- `POSTGRES_PASSWORD`
- `ENCRYPTION_KEY`
- `SECRET_KEY_BASE`

Настройки почты задаются в админке, не через deploy env.

## Деплой Через Kamal

Production service называется `msc_tda`. Приложение разворачивается из готового
GHCR image `ghcr.io/cheshir74/mcs:<version>`, который собирает GitHub Actions.

Первый production-деплой:

```bash
mise install
bundle install
mise trust
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-first-deploy
```

First-deploy сам:

- проверяет/настраивает SSH key access;
- генерирует локальные Kamal secrets;
- создает серверные директории;
- запускает Kamal setup;
- выполняет `rails db:prepare`;
- создает первого superadmin;
- печатает логин/пароль первого админа один раз в конце вывода.

Повторный production-деплой:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-deploy
```

Если в релизе есть миграции:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-deploy
```

Production-конфиги:

```text
config/deploy.yml
config/deploy.production.yml
.kamal/secrets.production
.kamal/deploy.production.local
mise.toml
```

Staging-команды:

```bash
mise run kamal-first-deploy
mise run kamal-deploy
mise run kamal-logs
```

Подробная инструкция: [DEPLOY_DOCKER.md](DEPLOY_DOCKER.md).

## Production SSL

Let's Encrypt SSL выпускает и обновляет `kamal-proxy`. Отдельный certbot не
нужен.

Перед включением SSL домен должен указывать A-записью на production server:

```text
89.22.234.238
```

После DNS-настройки команда сама спросит домен, сохранит его в
`.kamal/deploy.production.local`, перезапустит proxy и выполнит deploy:

```bash
KAMAL_VERSION=$(git rev-parse HEAD) mise run kamal-production-enable-ssl
```

## Production Data

Файлы Active Storage хранятся вне app-контейнера в обычной папке на сервере:

```text
/home/depus/msc_tda/storage
```

PostgreSQL data хранится вне Postgres-контейнера:

```text
/home/depus/msc_tda/postgres/data
```

Папка для бэкапов:

```text
/home/depus/msc_tda/backups
```

## Docker Image Из GitHub

Workflow:

```text
.github/workflows/ci-image.yml
```

Он запускает RSpec, собирает Docker image и публикует его в GHCR.

Публикуемые теги:

```text
ghcr.io/cheshir74/mcs:<git-sha>
ghcr.io/cheshir74/mcs:latest
```
