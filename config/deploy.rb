# config valid for current version and patch releases of Capistrano
lock "~> 3.11.2"

set :application_name, 'TolstosheevPhoto'
set :domain, '95.217.154.81'
set :deploy_to, '/home/depus/app_deploy'
set :repository, 'git@github.com:Cheshir74/MCS.git'
set :branch, 'master'
set :port, '22'
set :user, 'depus'
append :linked_files, "config/database.yml", "config/puma.rb", "config/master.key", "config/secrets.yml"
append :linked_dirs, "log", "tmp", "public/system",
set :bundle_options, -> { '' }