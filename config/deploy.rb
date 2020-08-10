require 'mina/bundler'
require 'mina/rails'
require 'mina/git'
require 'mina/rbenv'
require 'mina/nginx'
require 'mina/puma'
# require 'mina/rbenv'  # for rbenv support. (https://rbenv.org)
# require 'mina/rvm'    # for rvm support. (https://rvm.io)

# Basic settings:
#   domain       - The hostname to SSH to.
#   deploy_to    - Path to deploy into.
#   repository   - Git repo to clone from. (needed by mina/git)
#   branch       - Branch name to deploy. (needed by mina/git)

set :application_name, 'TolstosheevPhoto'
set :domain, '192.168.9.95'
#set :domain, 'projects74.ru'
set :deploy_to, '/homes/depus/app_deploy'
set :repository, 'git@github.com:Cheshir74/MCS.git'
set :branch, 'master'
set :port, '22'
#set :port, '9022'
set :user, 'depus'
set :shared_dirs,  fetch(:shared_dirs, []).push('tmp', 'log', 'public/uploads', 'public/system', 'storage')
set :shared_files, fetch(:shared_files, []).push('config/puma.rb', 'config/database.yml', 'config/master.key', 'config/secrets.yml')
set :bundle_options, -> { '' }

#set :rails_env, 'production'

task :remote_environment do
  invoke :'rbenv:load'
end

task :setup do
  command "#{fetch(:bundle_bin)} config set deployment 'true'"
  command "#{fetch(:bundle_bin)} config set path '#{fetch(:bundle_path)}'"
  command "#{fetch(:bundle_bin)} config set without '#{fetch(:bundle_withouts)}'"

  command %{mkdir -p "#{fetch(:shared_path)}/log"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/log"}

  command %{mkdir -p "#{fetch(:shared_path)}/config"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/config"}

  command %{touch "#{fetch(:shared_path)}/config/puma.rb"}
  command %{touch "#{fetch(:shared_path)}/config/database.yml"}
  command %{touch "#{fetch(:shared_path)}/config/secrets.yml"}

  command %{mkdir -p "#{fetch(:shared_path)}/tmp/sockets"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/tmp/sockets"}
  command %{mkdir -p "#{fetch(:shared_path)}/tmp/pids"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/tmp/pids"}
end

task :deploy do
  deploy do
    invoke :'rbenv:load'
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :'rails:db_migrate'
    invoke :'rails:assets_precompile'
    invoke :'deploy:cleanup'


    on :launch do
      invoke :'puma:restart'
    end
  end
end