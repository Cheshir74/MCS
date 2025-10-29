# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "2.0"


# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
Rails.application.config.assets.paths << Rails.root.join("node_modules/bootstrap-icons/font","node_modules/@fortawesome/fontawesome-free/webfonts", 'app', 'assets', 'builds')
# Ensure app/assets/fonts is in the asset path so font-url/font helpers resolve
Rails.application.config.assets.paths << Rails.root.join('app', 'assets', 'fonts')

# Precompile common font formats so they are available in production
Rails.application.config.assets.precompile += %w( *.svg *.eot *.woff *.woff2 *.ttf )

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )
