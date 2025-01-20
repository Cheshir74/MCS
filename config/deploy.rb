# config valid for current version and patch releases of Capistrano
lock "~> 3.17.3"

set :application, 'TolstosheevPhoto'
set :deploy_to, '/home/depus/app_deploy'
set :repo_url, 'git@github.com:Cheshir74/MCS.git'
append :linked_files, "config/database.yml", "config/master.key", "config/secrets.yml"
append :linked_dirs, "log", "tmp", "public/system", "storage"
namespace :deploy do
    desc 'Run migrations'
    task :migrate do
      on roles(:app) do
        within release_path do
          execute :rake, 'db:migrate'
        end
      end
    end
  
    desc 'Compile assets'
    task :precompile do
      on roles(:app) do
        within release_path do
          execute :rake, 'assets:precompile'
        end
      end
    end
  end
  
  # Правильная последовательность выполнения задач
  before 'deploy:assets:precompile', 'deploy:migrate'