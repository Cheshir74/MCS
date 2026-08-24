# MCS

Rails-приложение на Ruby 3.4.8, PostgreSQL, Puma и Active Storage.

В проекте поддерживаются два способа деплоя:

1. Capistrano на обычный сервер с Ruby, Node/Yarn, PostgreSQL, Puma и Nginx.
2. Docker Compose: Rails/Puma в контейнере, PostgreSQL отдельным контейнером, файлы вне контейнера.

Docker-вариант описан подробнее в [DEPLOY_DOCKER.md](DEPLOY_DOCKER.md).

## Что Хранится Вне Кода

Не коммитить в git:

- `config/master.key`
- `config/credentials.yml.enc`, если репозиторий не приватный и нет отдельного правила хранения
- `config/database.yml`
- `.env.production`
- загруженные файлы из `storage`
- PostgreSQL dump-файлы

Для production нужны:

- `RAILS_MASTER_KEY`
- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `MAILER_HOST`
- SMTP-настройки в credentials или через текущий механизм `SiteSetting`

## Локальная Подготовка

1. Установить Ruby:

   ```bash
   ruby -v
   ```

   Ожидаемая версия:

   ```text
   3.4.8
   ```

2. Установить Ruby-зависимости:

   ```bash
   bundle install
   ```

3. Установить JS-зависимости:

   ```bash
   node .yarn/releases/yarn-4.18.0.cjs install --immutable
   ```

4. Подготовить БД:

   ```bash
   cp config/database.yml.example config/database.yml
   bin/rails db:create
   bin/rails db:migrate
   ```

5. Собрать frontend:

   ```bash
   node .yarn/releases/yarn-4.18.0.cjs run build
   ```

6. Запустить локально:

   ```bash
   bin/dev
   ```

## Общая Production-Подготовка

Перед любым способом деплоя:

1. Проверить, что домен указывает на сервер.
2. Подготовить PostgreSQL database/user/password.
3. Подготовить `RAILS_MASTER_KEY` и `credentials.yml.enc`.
4. Подготовить SMTP-настройки.
5. Решить, где будут лежать файлы Active Storage:

   - Capistrano: `/home/depus/app_deploy/shared/storage`
   - Docker: `/srv/mcs/data/storage`
   - будущий лучший вариант: S3-compatible storage

6. Сделать бэкап перед миграцией:

   ```bash
   pg_dump -Fc -d MSC_production -f mcs-before-deploy.dump
   rsync -a storage/ storage-backup/
   ```

## Деплой Через Capistrano

Этот способ использует текущую схему: Ruby и Node установлены на сервере, код выкладывается в `/home/depus/app_deploy`, Puma запускается на сервере, Nginx проксирует запросы.

### 1. Подготовить Сервер

На сервере должны быть:

- Ruby 3.4.8 через rbenv
- PostgreSQL client/server или доступ к внешней PostgreSQL
- Node.js
- Yarn release из `.yarn/releases/yarn-4.18.0.cjs`
- Nginx
- systemd service для Puma
- директория `/home/depus/app_deploy`

### 2. Подготовить Shared-Файлы

На сервере:

```bash
mkdir -p /home/depus/app_deploy/shared/config
mkdir -p /home/depus/app_deploy/shared/storage
mkdir -p /home/depus/app_deploy/shared/log
mkdir -p /home/depus/app_deploy/shared/tmp/pids
mkdir -p /home/depus/app_deploy/shared/tmp/cache
mkdir -p /home/depus/app_deploy/shared/tmp/sockets
```

Положить:

```text
/home/depus/app_deploy/shared/config/database.yml
/home/depus/app_deploy/shared/config/master.key
/home/depus/app_deploy/shared/config/credentials.yml.enc
```

### 3. Проверить Stage

Текущий stage:

```text
config/deploy/staging.rb
```

В нем задан сервер:

```text
192.168.11.248:2222
user: depus
branch: new_version_design
rails_env: production
```

Перед production-деплоем проверить branch, host, user и SSH-доступ.

### 4. Выполнить Деплой

```bash
bundle exec cap staging deploy
```

Capistrano выполнит:

- проверку `master.key` и `credentials.yml.enc`
- установку gem-зависимостей
- сборку frontend через Yarn
- `db:migrate`
- `assets:precompile`
- restart Puma

### 5. Проверить После Деплоя

Проверить:

- главную страницу
- вход пользователя
- админку
- загрузку новых файлов
- отображение старых файлов из `shared/storage`
- отправку почты
- логи Puma и Rails

## Деплой Через Docker Compose

Этот способ делает приложение переносимее: app-контейнер можно пересобирать и удалять, а БД и загруженные файлы остаются в volume-директориях на сервере.

В проекте есть два Docker-режима:

- локальная сборка на сервере: `DEPLOY_FROM_REGISTRY=false`
- предсобранный image из GitHub Container Registry: `DEPLOY_FROM_REGISTRY=true`

Для production лучше второй режим: GitHub сначала прогоняет тесты, потом собирает image, а сервер только скачивает готовый image.

### 1. Подготовить Сервер

На сервере нужны:

- Docker
- Docker Compose v2
- Nginx или Caddy для TLS и reverse proxy

Рекомендуемая директория:

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

### 2. Подготовить Env

```bash
bin/docker-setup
```

Скрипт создаст директории `data`, `backups`, `secrets`, создаст `.env.production` из `.env.production.example` и попробует скопировать `config/credentials.yml.enc` в `secrets/credentials.yml.enc`.

После этого заполнить реальные значения в `.env.production`:

```text
RAILS_MASTER_KEY=...
MAILER_HOST=example.com
POSTGRES_DB=MSC_production
POSTGRES_USER=mcs
POSTGRES_PASSWORD=...
DATABASE_HOST=postgres
DATABASE_NAME=MSC_production
DATABASE_USER=mcs
DATABASE_PASSWORD=...
```

Если деплой идёт из GitHub Container Registry, выставить:

```text
DEPLOY_FROM_REGISTRY=true
WEB_IMAGE=ghcr.io/cheshir74/mcs:latest
```

Для деплоя конкретной версии можно заменить `latest` на commit SHA:

```text
WEB_IMAGE=ghcr.io/cheshir74/mcs:<commit-sha>
```

### 3. Подготовить Credentials

Если `bin/docker-setup` не смог скопировать credentials автоматически, положить файл вручную:

```text
secrets/credentials.yml.enc
```

Ключ расшифровки передается через `RAILS_MASTER_KEY` в `.env.production`.

### 4. Собрать И Запустить

```bash
bin/docker-deploy
```

Скрипт сам выполнит build, запуск PostgreSQL, миграции, запуск Rails и покажет статус контейнеров.

Обычный повторный деплой после изменений:

```bash
git pull
bin/docker-deploy
```

Rails будет доступен на:

```text
127.0.0.1:3000
```

Nginx/Caddy должен проксировать публичный домен на этот адрес.

### 5. Проверить После Запуска

```bash
docker compose -f compose.production.yml ps
docker compose -f compose.production.yml logs -f web
```

Проверить в браузере:

- главную страницу
- логин
- админку
- загрузку файла
- отображение существующих файлов
- отправку почты

## Миграция С Capistrano На Docker

1. Остановить запись данных на старом приложении или включить maintenance mode.
2. Сделать dump старой БД:

   ```bash
   pg_dump -Fc -d MSC_production -f /srv/mcs/backups/mcs.dump
   ```

3. Запустить PostgreSQL в Docker:

   ```bash
   docker compose -f compose.production.yml up -d postgres
   ```

4. Восстановить dump:

   ```bash
   docker compose -f compose.production.yml exec -T postgres sh -c \
     'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
     < /srv/mcs/backups/mcs.dump
   ```

5. Перенести Active Storage:

   ```bash
   rsync -a /home/depus/app_deploy/shared/storage/ /srv/mcs/data/storage/
   ```

6. Запустить миграции:

   ```bash
   bin/docker-deploy
   ```

7. Переключить Nginx/Caddy с текущего Puma socket/port на `127.0.0.1:3000`.
8. Проверить сайт.
9. Сохранять старый Capistrano-деплой до подтверждения, что Docker-версия работает стабильно.

## Сборка В GitHub

Workflow лежит здесь:

```text
.github/workflows/ci-image.yml
```

Он делает:

1. Запускает PostgreSQL service.
2. Ставит Ruby и JS-зависимости.
3. Собирает frontend.
4. Создаёт `config/database.yml` из `config/database.yml.example`.
5. Выполняет `rails db:prepare`.
6. Запускает `bundle exec rspec`.
7. Если это `push`, собирает Docker image и пушит его в GHCR.

Что нужно сделать в GitHub:

1. Запушить изменения в репозиторий.
2. Открыть `Actions` и проверить workflow `CI Image`.
3. В настройках репозитория проверить, что Actions имеет право писать packages:

   ```text
   Settings -> Actions -> General -> Workflow permissions -> Read and write permissions
   ```

4. После успешного workflow image появится в GitHub Packages/GHCR:

   ```text
   ghcr.io/cheshir74/mcs:latest
   ghcr.io/cheshir74/mcs:<commit-sha>
   ```

5. На сервере включить pull готового image:

   ```text
   DEPLOY_FROM_REGISTRY=true
   WEB_IMAGE=ghcr.io/cheshir74/mcs:latest
   ```

6. Если GitHub package private, один раз залогиниться на сервере в GHCR:

   ```bash
   echo "<github-token-with-read-packages>" | docker login ghcr.io -u "<github-username>" --password-stdin
   ```

7. Выполнить:

   ```bash
   bin/docker-deploy
   ```

## Откат

### Capistrano

```bash
bundle exec cap staging deploy:rollback
```

Если была миграция БД, отдельно оценить обратимость миграции.

### Docker

1. Вернуть предыдущий image tag или git revision.
2. Пересобрать и перезапустить:

   ```bash
   bin/docker-deploy
   ```

3. Если нужно, восстановить БД из dump:

   ```bash
   docker compose -f compose.production.yml exec -T postgres sh -c \
     'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
     < /srv/mcs/backups/mcs-before-deploy.dump
   ```

## Бэкапы

Для Docker:

```bash
bin/docker-backup
```

Для Capistrano:

```bash
pg_dump -Fc -d MSC_production -f mcs-$(date +%F).dump
rsync -a /home/depus/app_deploy/shared/storage/ storage-backup/
```

## Что Улучшить Следующим Шагом

1. Перенести Active Storage с локального диска на S3-compatible storage.
2. Добавить отдельные image tags вместо `mcs-web:latest`.
3. Добавить healthcheck для Rails.
4. Добавить автоматический backup PostgreSQL и `storage`.
5. Убрать реальные пароли из `config/database.yml` и использовать только env/credentials.
