threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }.to_i
threads threads_count, threads_count

environment ENV.fetch("RAILS_ENV") { "development" }
port ENV.fetch("PORT") { 3000 }

if ENV["RAILS_ENV"] == "production"
  pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }
  workers ENV.fetch("WEB_CONCURRENCY") { 2 }.to_i
  preload_app!
end

plugin :tmp_restart
