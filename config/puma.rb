app_dir = File.expand_path("../..", __FILE__)
shared_dir = "/home/depus/app_deploy/shared"

threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count
port        ENV.fetch("PORT") { 3000 }
environment ENV.fetch("RAILS_ENV") { "production" }

pidfile "#{shared_dir}/tmp/pids/puma.pid"
state_path "#{shared_dir}/tmp/pids/puma.state"
stdout_redirect "#{shared_dir}/tmp/log/puma.stdout.log", "#{shared_dir}/tmp/log/puma.stderr.log", true

workers ENV.fetch("WEB_CONCURRENCY") { 2 }
preload_app!

bind "unix://#{shared_dir}/tmp/sockets/puma.sock"

plugin :tmp_restart