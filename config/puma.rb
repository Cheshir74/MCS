app_dir = File.expand_path("../..", __FILE__)
shared_dir = "/home/depus/app_deploy/shared"

threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count

environment ENV.fetch("RAILS_ENV") { "development" }

pidfile "#{shared_dir}/tmp/pids/puma.pid" if ENV["RAILS_ENV"] == "production"
state_path "#{shared_dir}/tmp/pids/puma.state" if ENV["RAILS_ENV"] == "production"

if ENV["RAILS_ENV"] == "production"
  stdout_redirect "#{shared_dir}/log/puma.stdout.log", "#{shared_dir}/log/puma.stderr.log", true
  bind "unix://#{shared_dir}/tmp/sockets/puma.sock"
end

workers ENV.fetch("WEB_CONCURRENCY") { 2 } if ENV["RAILS_ENV"] == "production"
preload_app! if ENV["RAILS_ENV"] == "production"

plugin :tmp_restart
