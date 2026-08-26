class ApplicationMailer < ActionMailer::Base
  default from: -> { SiteSetting.mailer_sender }
  layout 'mailer'
end
