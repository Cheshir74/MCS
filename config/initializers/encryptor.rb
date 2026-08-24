Rails.application.config.after_initialize do
  encryption_key = ENV["ENCRYPTION_KEY"].presence || Rails.application.credentials.encryption_key
  raise "Encryption key is missing" if encryption_key.blank?

  encryption_key_bytes = [encryption_key].pack("H*")
  Rails.application.config.encryptor = ActiveSupport::MessageEncryptor.new(encryption_key_bytes)
end
