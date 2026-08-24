# encoding: utf-8
# Override capistrano-puma 0.2.3 task to use --control-url instead of deprecated --control
# Puma 6.6.0 made --control ambiguous due to addition of --control-url

# Clear existing tasks from capistrano-puma gem first to avoid duplicate execution
%w[puma:start puma:stop puma:restart puma:status puma:overview].each do |name|
  Rake::Task[name].clear if Rake::Task.task_defined?(name)
end

namespace :puma do
  def puma_start_command
    [
      "exec puma -b '#{fetch(:puma_socket)}'",
      " -e #{fetch(:stage)} ",
      "--control-url '#{fetch(:pumactl_socket)}'",
      "-S #{fetch(:puma_state)}",
      fetch(:puma_flags),
      ">> #{fetch(:puma_log)} 2>&1 &"
    ]
  end

  desc "Start puma instance for this application"
  task :start do
    on roles fetch(:puma_roles) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :bundle, *puma_start_command
        end
      end
    end
  end

  desc "Stop puma instance for this application"
  task :stop do
    on roles fetch(:puma_roles) do
      within release_path do
        execute :bundle, "exec pumactl -S #{fetch(:puma_state)} stop"
      end
    end
  end

  desc "Restart puma instance for this application"
  task :restart do
    on roles fetch(:puma_roles) do
      within release_path do
        begin
          execute :bundle, "exec pumactl -S #{fetch(:puma_state)} restart"
        rescue SSHKit::Command::Failed => e
          warn "Puma restart failed via control socket: #{e.message}"
          warn "Starting Puma instead"
          with rails_env: fetch(:rails_env) do
            execute :bundle, *puma_start_command
          end
        end
      end
    end
  end

  desc "Show status of puma for this application"
  task :status do
    on roles fetch(:puma_roles) do
      within release_path do
        execute :bundle, "exec pumactl -S #{fetch(:puma_state)} stats"
      end
    end
  end

  desc "Show status of puma for all applications"
  task :overview do
    on roles fetch(:puma_roles) do
      within release_path do
        execute :bundle, "exec puma status"
      end
    end
  end

end
