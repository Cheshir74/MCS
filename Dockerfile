# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.4.8
FROM ruby:${RUBY_VERSION}-slim AS base

WORKDIR /app

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libjemalloc2 \
      libpq5 \
      libvips \
      postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libpq-dev \
      nodejs \
      pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock .ruby-version ./
RUN gem install bundler -v 2.7.1 && \
    bundle install && \
    rm -rf ~/.bundle/ /usr/local/bundle/ruby/*/cache /usr/local/bundle/ruby/*/bundler/gems/*/.git

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN ln -s /app/.yarn/releases/yarn-4.18.0.cjs /usr/local/bin/yarn && \
    ln -s /app/.yarn/releases/yarn-4.18.0.cjs /usr/local/bin/yarnpkg && \
    yarn install --immutable

COPY . .

ARG MAILER_HOST=example.com
RUN cp config/database.yml.example config/database.yml && \
    SECRET_KEY_BASE_DUMMY=1 \
    MAILER_HOST=${MAILER_HOST} \
    ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000 \
    bundle exec rails assets:precompile && \
    rm config/database.yml

FROM base

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p log storage tmp/pids tmp/cache && \
    chown -R rails:rails log storage tmp

USER rails

ENTRYPOINT ["/app/bin/docker-entrypoint"]
EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
