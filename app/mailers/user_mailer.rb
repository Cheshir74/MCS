class UserMailer < ApplicationMailer
  default from: 'noreply@techbuben.ru'

  def send_welcome_email(user)
    @user = user
    mail(:to => @user.email, :subject => "Welcome!")
  end
end
