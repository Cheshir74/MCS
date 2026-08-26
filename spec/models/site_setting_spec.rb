require 'rails_helper'

RSpec.describe SiteSetting, type: :model do
  describe '.apply_mailer_settings' do
    it 'configures Action Mailer from the persisted site settings' do
      described_class.create!(
        email_address: 'smtp.example.com',
        email_port: '2525',
        email_login: 'noreply@example.com',
        email_password: 'secret-password',
        email_domain: 'example.com',
        email_tls: false,
        email_ssl: true
      )

      described_class.apply_mailer_settings

      expect(ActionMailer::Base.smtp_settings).to include(
        address: 'smtp.example.com',
        port: 2525,
        user_name: 'noreply@example.com',
        password: 'secret-password',
        domain: 'example.com',
        enable_starttls_auto: false,
        ssl: true
      )
      expect(ActionMailer::Base.default_url_options).to eq(host: 'example.com')
      expect(Rails.application.config.action_mailer.default_url_options).to eq(host: 'example.com')
    end
  end

  describe '.mailer_sender' do
    it 'uses the SMTP login from the admin settings' do
      described_class.create!(email_login: 'mailbox@example.com')

      expect(described_class.mailer_sender).to eq('mailbox@example.com')
    end
  end
end
