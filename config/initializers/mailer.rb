Rails.application.configure do
    Rails.application.config.after_initialize do
        config.action_mailer.smtp_settings = SiteSetting.mailer_settings
        ActionMailer::Base.smtp_settings = Rails.application.config.action_mailer.smtp_settings
    end
end
