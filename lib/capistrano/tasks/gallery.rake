namespace :gallery do
  desc "Regenerate gallery variants on deployment"
  task :regenerate_variants do
    on roles(fetch(:gallery_roles, :app)) do
      within release_path do
        env = { rails_env: fetch(:rails_env) }
        env[:RESET_VARIANTS] = "1" if fetch(:gallery_reset_variants, false)

        with env do
          execute :bundle, :exec, :rails, "gallery:regenerate_variants"
        end
      end
    end
  end
end

after "deploy:published", "gallery:regenerate_variants"
