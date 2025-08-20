# config valid for current version of Capistrano
lock "~> 3.17.3"

set :application, 'Photohub'
set :repo_url, 'git@github.com:Cheshir74/MCS.git'
set :deploy_to, '/home/depus/app_deploy'

# Linked files and dirs
append :linked_files, "config/database.yml", "config/master.key", "config/credentials/production.key"
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system", "storage"

# Ruby environment
set :rbenv_type, :user
set :rbenv_ruby, '3.3.0'

# Default environment variables
set :default_env, {
  'RAILS_MASTER_KEY' => File.read("#{shared_path}/config/master.key").strip
}

# Puma settings
set :puma_threads, [4, 16]
set :puma_workers, 2
set :puma_bind, "unix://#{shared_path}/tmp/sockets/puma.sock"
set :puma_state, "#{shared_path}/tmp/pids/puma.state"
set :puma_pid, "#{shared_path}/tmp/pids/puma.pid"
set :puma_access_log, "#{shared_path}/log/puma.access.log"
set :puma_error_log, "#{shared_path}/log/puma.error.log"
set :puma_preload_app, true
set :puma_worker_timeout, nil
set :puma_init_active_record, true

namespace :deploy do
  desc 'Run DB migrations'
  task :migrate do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :bundle, 'exec rake db:migrate'
        end
      end
    end
  end

  desc 'Build JS assets'
  task :build_js_assets do
    on roles(:web) do
      within release_path do
        execute :yarn, 'install --immutable'
        execute :yarn, 'run build'
      end
    end
  end

  desc 'Restart Puma'
  task :restart do
    on roles(:app) do
      invoke 'puma:restart'
    end
  end
end

# Hooks sequence
after 'deploy:updated', 'deploy:migrate'
after 'deploy:updated', 'deploy:build_js_assets'
after 'deploy:migrate', 'deploy:assets:precompile'
after 'deploy:publishing', 'deploy:restart'
