namespace :server do
  def project_bundler_version
    File.read("Gemfile.lock").match(/BUNDLED WITH\n\s+(\S+)/)[1]
  end

  def project_yarn_version
    File.read("package.json").match(/"packageManager"\s*:\s*"yarn@([^"]+)"/)[1]
  end

  def capistrano_dry_run?
    defined?(SSHKit::Backend::Printer) && SSHKit.config.backend == SSHKit::Backend::Printer
  end

  desc "Install project runtime versions with rbenv and verify system deps"
  task :bootstrap do
    ruby_version = fetch(:rbenv_ruby)
    bundler_version = project_bundler_version
    yarn_version = project_yarn_version
    rbenv_bin = "#{fetch(:rbenv_path, '$HOME/.rbenv')}/bin/rbenv"

    on roles(:app) do
      info "Bootstrapping Ruby #{ruby_version}, Bundler #{bundler_version}; project Yarn is #{yarn_version}"

      unless test("[ -x #{rbenv_bin} ]")
        error "rbenv not found at #{rbenv_bin}. Install rbenv and ruby-build on the server first."
        exit 1
      end

      unless test("#{rbenv_bin} commands | grep -qx install")
        error "rbenv install command is missing. Install ruby-build on the server first."
        exit 1
      end

      if test("[ -d #{fetch(:rbenv_path, '$HOME/.rbenv')}/plugins/ruby-build/.git ]")
        execute :git, "-C #{fetch(:rbenv_path, '$HOME/.rbenv')}/plugins/ruby-build pull --ff-only"
      end

      execute rbenv_bin, "install -s #{ruby_version}"
      execute rbenv_bin, "rehash"
      execute "RBENV_VERSION=#{ruby_version} #{rbenv_bin} exec gem install bundler -v #{bundler_version} --no-document"
      execute rbenv_bin, "rehash"

      unless test("command -v node >/dev/null 2>&1")
        error "node is missing. Install Node.js on the server before deploy."
        exit 1
      end

    end

    Rake::Task["server:doctor"].invoke
  end

  task :maybe_bootstrap do
    invoke "server:bootstrap" if fetch(:bootstrap_runtime_on_deploy, true)
  end

  desc "Verify server runtime versions required by this release"
  task :doctor do
    ruby_version = fetch(:rbenv_ruby)
    bundler_version = project_bundler_version
    yarn_version = project_yarn_version
    rbenv_bin = "#{fetch(:rbenv_path, '$HOME/.rbenv')}/bin/rbenv"

    on roles(:app) do
      unless test("#{rbenv_bin} versions --bare | grep -qx #{ruby_version}")
        error "Ruby #{ruby_version} is not installed under rbenv."
        exit 1
      end

      if capistrano_dry_run?
        info "Skipping captured version checks in dry-run mode"
        next
      end

      actual_bundler = capture("RBENV_VERSION=#{ruby_version} #{rbenv_bin} exec bundle -v").strip
      unless actual_bundler.include?(bundler_version)
        error "Bundler #{bundler_version} is required, got: #{actual_bundler}"
        exit 1
      end

      yarn_release_path = fetch(:yarn_release_path, ".yarn/releases/yarn-#{yarn_version}.cjs")
      repo_yarn_path = "#{fetch(:deploy_to)}/repo/#{yarn_release_path}"
      current_yarn_path = "#{fetch(:current_path)}/#{yarn_release_path}"

      unless test("[ -f #{repo_yarn_path} ] || [ -f #{current_yarn_path} ]")
        warn "Project Yarn release is not present yet; it will be verified during deploy:build_frontend."
        actual_yarn = yarn_version
      else
        yarn_path = test("[ -f #{current_yarn_path} ]") ? current_yarn_path : repo_yarn_path
        actual_yarn = capture(:node, "#{yarn_path} --version").strip
        unless actual_yarn == yarn_version
          error "Yarn #{yarn_version} is required, got: #{actual_yarn}"
          exit 1
        end
      end

      unless test("command -v vips >/dev/null 2>&1")
        error "libvips is missing. Install it on the server, then run server:doctor again."
        exit 1
      end

      info "Runtime OK: Ruby #{ruby_version}, #{actual_bundler}, Yarn #{actual_yarn}, libvips present"
    end
  end
end

before "deploy:starting", "server:maybe_bootstrap"
