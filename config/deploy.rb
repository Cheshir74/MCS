# config valid for current version of Capistrano
lock "~> 3.17.3"

set :application, 'Photohub'
set :repo_url, 'git@github.com:Cheshir74/MCS.git'
set :deploy_to, '/home/depus/app_deploy'

# Linked files and dirs
append :linked_files, "config/database.yml", "config/master.key", "config/credentials.yml.enc"
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system", "storage"

# Ruby environment
set :rbenv_type, :user
set :rbenv_ruby, '3.3.0'

# Default environment variables
set :default_env, {
  'RAILS_MASTER_KEY' => ENV['RAILS_MASTER_KEY']
}

# Puma settings
set :puma_conf, "#{shared_path}/puma.rb"
set :puma_state, "#{shared_path}/tmp/pids/puma.state"
set :puma_pid, "#{shared_path}/tmp/pids/puma.pid"
set :puma_preload_app, true
set :puma_worker_timeout, nil
set :puma_init_active_record, true

set :gallery_reset_variants, false

namespace :deploy do
  desc "🔑 Check master.key and credentials.yml.enc existence"
  task :check_keys do
    on roles(:app) do
      within shared_path do
        info "---- 🔑 Checking master.key ----"
        if test("[ -f #{shared_path}/config/master.key ]")
          key = capture(:cat, "#{shared_path}/config/master.key").strip
          info "✅ master.key exists"
          info "   Content: #{key}"
        else
          error "❌ master.key missing"
          exit 1
        end

        info "---- 📜 Checking credentials.yml.enc ----"
        if test("[ -f #{shared_path}/config/credentials.yml.enc ]")
          info "✅ credentials.yml.enc exists"
        else
          error "❌ credentials.yml.enc missing"
          exit 1
        end
      end
    end
  end

  desc "🔓 Show decrypted credentials (after release is ready)"
  task :show_credentials do
    on roles(:app) do
      if test("[ -d #{release_path} ]")
        within release_path do
          with rails_env: fetch(:rails_env) do
            creds = capture(:bundle, "exec rails credentials:show || true")
            if creds.strip.empty?
              warn "⚠️ Failed to decrypt credentials (check master.key)"
            else
              info "🔓 credentials decrypted:\n#{creds}"
            end
          end
        end
      else
        warn "⚠️ release_path not found — skipping credentials:show"
      end
    end
  end

  desc '📦 Run DB migrations'
  task :migrate do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :bundle, 'exec rake db:migrate'
        end
      end
    end
  end

  desc '🛠️ Build frontend assets (JS + CSS)'
  task :build_frontend do
    on roles(:web) do
      within release_path do
        with rails_env: fetch(:rails_env), node_env: 'production' do
          execute :yarn, 'install --immutable'
          execute :yarn, 'run build'
        end
      end
    end
  end

  desc '🧹 Clean shared assets cache before precompile'
  task :clean_assets do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :bundle, 'exec rake assets:clobber'
          execute :bundle, 'exec rake tmp:cache:clear'
        end
      end
    end
  end

  desc '🔄 Restart Puma'
  task :restart do
    on roles(:app) do
      invoke 'puma:restart'
    end
  end
end

# Hooks sequence
before 'deploy:updated', 'deploy:check_keys'
before 'deploy:assets:precompile', 'deploy:show_credentials'
before 'deploy:assets:precompile', 'deploy:clean_assets'
before 'deploy:assets:precompile', 'deploy:build_frontend'
after 'deploy:updated', 'deploy:migrate'
after 'deploy:migrate', 'deploy:assets:precompile'
after 'deploy:publishing', 'deploy:restart'
