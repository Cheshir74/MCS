Rails.application.configure do
  config.after_initialize do
    SiteSetting.apply_mailer_settings
  end
end
