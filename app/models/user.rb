class User < ApplicationRecord
  EMAIL_CHANGE_CODE_TTL = 15.minutes

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  after_create :send_admin_mail
  validate :must_keep_at_least_one_superadmin
  before_destroy :must_keep_at_least_one_superadmin_on_destroy

  def send_admin_mail
    UserMailer.send_welcome_email(self).deliver_later
  end

  def self.get_value(key, default = nil)
    find_by(name: key)&.value || default
  end

  def self.get_boolean(key, default = false)
    value = get_value(key, nil)
    ActiveModel::Type::Boolean.new.cast(value) || default
  end

  def prepare_email_change!(next_email)
    normalized_email = self.class.normalize_email(next_email)
    raw_code = format("%06d", SecureRandom.random_number(1_000_000))

    update!(
      pending_email: normalized_email,
      email_change_code_digest: self.class.email_change_code_digest_for(normalized_email, raw_code),
      email_change_code_sent_at: Time.current
    )

    raw_code
  end

  def confirm_pending_email_change!(submitted_code)
    return false unless email_change_code_valid?(submitted_code)

    transaction do
      update!(
        email: pending_email,
        pending_email: nil,
        email_change_code_digest: nil,
        email_change_code_sent_at: nil
      )
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def clear_pending_email_change!
    update_columns(
      pending_email: nil,
      email_change_code_digest: nil,
      email_change_code_sent_at: nil
    )
  end

  def pending_email_change?
    pending_email.present? && email_change_code_digest.present? && email_change_code_sent_at.present?
  end

  def email_change_code_expired?
    return true if email_change_code_sent_at.blank?

    email_change_code_sent_at < EMAIL_CHANGE_CODE_TTL.ago
  end

  def email_change_code_valid?(submitted_code)
    return false if submitted_code.blank? || !pending_email_change? || email_change_code_expired?

    expected_digest = self.class.email_change_code_digest_for(pending_email, submitted_code.to_s.strip)
    ActiveSupport::SecurityUtils.secure_compare(expected_digest, email_change_code_digest)
  end

  def self.normalize_email(value)
    value.to_s.strip.downcase
  end

  def self.email_change_code_digest_for(email_value, code)
    Digest::SHA256.hexdigest("#{Rails.application.secret_key_base}/#{normalize_email(email_value)}/#{code}")
  end

  private

  def must_keep_at_least_one_superadmin
    return unless persisted?
    return unless will_save_change_to_superadmin_role?
    return if superadmin_role?
    return if self.class.where(superadmin_role: true).where.not(id: id).exists?

    errors.add(:superadmin_role, "At least one superadmin must remain.")
  end

  def must_keep_at_least_one_superadmin_on_destroy
    return unless superadmin_role?
    return if self.class.where(superadmin_role: true).where.not(id: id).exists?

    errors.add(:base, "At least one superadmin must remain.")
    throw(:abort)
  end

end
