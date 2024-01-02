# config valid for current version and patch releases of Capistrano
lock "~> 3.18.0"

set :application, 'TolstosheevPhoto'
set :deploy_to, '/home/depus/app_deploy'
set :repo_url, 'git@github.com:Cheshir74/MCS.git'
append :linked_files, "config/database.yml", "config/master.key", "config/credentials.yml.enc"
append :linked_dirs, "log", "tmp", "public/system", "storage"

before "deploy:assets:precompile", "deploy:yarn_install"
namespace :deploy do
  desc "Run rake yarn install"
  task :yarn_install do
    on roles(:web) do
      within release_path do
        execute("cd #{release_path} && yarn install --silent --no-progress --no-audit --no-optional")
      end
    end
  end
end