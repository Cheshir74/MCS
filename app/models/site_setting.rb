require 'active_support/message_encryptor'

class SiteSetting < ApplicationRecord
  has_one_attached :favicon
  after_save :update_mailer_settings

  def update_mailer_settings
    ActionMailer::Base.smtp_settings = {
      address: SiteSetting.get_value('email_address', 'localhost'),
      port: SiteSetting.get_value('email_port', 587),
      user_name: SiteSetting.get_value('email_login', 'user@example.com'),
      password: SiteSetting.get_value('email_password', 'password'),
      enable_starttls_auto: SiteSetting.get_value('email_tls', true),
      ssl: SiteSetting.get_value('email_ssl', false)
    }
  end

  def email_password
    Rails.application.config.encryptor.decrypt_and_verify(self[:email_password]) if self[:email_password].present?
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    nil
  end

  def email_password=(password)
    self[:email_password] = Rails.application.config.encryptor.encrypt_and_sign(password) if password.present?
  end

  def self.get_value(key, default = nil)
      # Проверяем, существует ли таблица site_settings
    unless ActiveRecord::Base.connection.table_exists?('site_settings')
      Rails.logger.warn("Таблица 'site_settings' отсутствует в базе данных.")
      return default
    end

    # Получаем первую запись настроек
    setting = self.first # Используем self.first для вызова метода модели

    # Проверяем, существует ли объект setting
    if setting.nil?
      Rails.logger.warn("Настройки не найдены в таблице 'site_settings'.")
      return default
    end

    # Проверяем, существует ли метод или атрибут key в setting
    unless setting.respond_to?(key)
      Rails.logger.warn("Метод или атрибут '#{key}' отсутствует в модели SiteSetting.")
      return default
    end

    value = setting&.send(key)

    # Если значение существует и его нужно интерпретировать как булевое
    if [true, false].include?(value)
      return value
    elsif key.to_s.include?('email_') && value.present?
      # Преобразуем значение в булевое значение (если это строка 'true' или 'false')
      if value.to_s.downcase == 'true'
        return true
      elsif value.to_s.downcase == 'false'
        return false
      end
    end

    # Преобразование строки в число (для порта)
    if key.to_s.include?('port') && value.present?
      return value.to_i
    end

    # Возвращаем значение по умолчанию, если значение пустое
    value || default
  end
end
