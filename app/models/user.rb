class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  after_create :send_admin_mail
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

end
