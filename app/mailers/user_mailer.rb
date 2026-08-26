class UserMailer < ApplicationMailer
  def send_welcome_email(user)
    @user = user
    mail(:to => @user.email, :subject => "Welcome!")
  end

  def admin_email_change_code(user, next_email, code)
    @user = user
    @next_email = next_email
    @code = code
    @expires_in_minutes = (User::EMAIL_CHANGE_CODE_TTL / 60).to_i

    mail(to: @next_email, subject: "Confirm email change")
  end
end
