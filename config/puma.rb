app_dir = "/home/depus/app_deploy"
shared_dir = "#{app_dir}/shared"
current_dir = "#{app_dir}/current"

threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }.to_i
threads threads_count, threads_count

environment ENV.fetch("RAILS_ENV") { "development" }

if ENV["RAILS_ENV"] == "production"
  if ENV["DOCKER_CONTAINER"] == "true"
    pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }
  else
    directory current_dir
    rackup "#{current_dir}/config.ru"

    pidfile "#{shared_dir}/tmp/pids/puma.pid"
    state_path "#{shared_dir}/tmp/pids/puma.state"

    stdout_redirect "#{shared_dir}/log/puma.stdout.log", "#{shared_dir}/log/puma.stderr.log", true
  end

  workers ENV.fetch("WEB_CONCURRENCY") { 2 }.to_i
  preload_app!
end

plugin :tmp_restart
