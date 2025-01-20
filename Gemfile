source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.3.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails'
gem 'pg'
# Use Puma as the app server
gem 'puma'
gem 'jsbundling-rails'
gem 'cssbundling-rails'
gem 'stimulus-rails'
gem 'sprockets-rails'
gem 'turbolinks'
gem 'turbo-rails'
gem 'bcrypt'
gem 'rails-i18n'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.7'


# Use Active Storage variant
 gem 'image_processing', '~> 1.2'

gem 'devise'
gem 'cancancan'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.4.4', require: false

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console'
  gem 'listen', '~> 3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  # For deploy
  gem 'capistrano', '~> 3.17.0'
  gem 'capistrano-rails', '~> 1.6.0'
  gem 'capistrano-rbenv', '~> 2.2.0'
  gem 'capistrano-puma'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 2.15'
 # gem 'selenium-webdriver'
  # Easy installation and use of web drivers to run system tests with browsers
  #gem 'webdrivers'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]



gem 'slim'

group :test, :development do
  gem 'rails-controller-testing'
  gem 'rspec-rails'
  gem 'factory_bot'
end

group :test do
  gem 'shoulda-matchers'
end