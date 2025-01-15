require 'active_support/message_encryptor'

class SiteSetting < ApplicationRecord
  has_one_attached :favicon

  encryption_key_bytes = [Rails.application.credentials.encryption_key].pack("H*")
  ENCRYPTOR = ActiveSupport::MessageEncryptor.new(encryption_key_bytes)

  def email_password
    ENCRYPTOR.decrypt_and_verify(self[:email_password]) if self[:email_password].present?
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    nil
  end

  def email_password=(password)
    self[:email_password] = ENCRYPTOR.encrypt_and_sign(password) if password.present?
  end

end
