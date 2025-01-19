Rails.application.configure do
    Rails.application.config.after_initialize do
        Rails.application.eager_load!

    
        config.action_mailer.smtp_settings = {
        address: SiteSetting.get_value('email_address', 'localhost'),
        port: SiteSetting.get_value('email_port', 587),
        user_name: SiteSetting.get_value('email_login', 'user@example.com'),
        password: SiteSetting.get_value('email_password', 'password'),
        enable_starttls_auto: SiteSetting.get_value('email_tls', true),
        ssl: SiteSetting.get_value('email_ssl', false)
        }
        ActionMailer::Base.smtp_settings = Rails.application.config.action_mailer.smtp_settings

    end

end