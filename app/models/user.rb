class User < ApplicationRecord
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
