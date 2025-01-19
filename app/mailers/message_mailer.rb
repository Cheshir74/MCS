class MessageMailer < ApplicationMailer
    default from: SiteSetting.get_value('email_login')

    def contact_email(name, email, body)
        @name = name
        @email = email
        @body = body
        
        mail(to: SiteSetting.get_value('email_contact'), subject: "New message on #{SiteSetting.get_value('email_domain')}")
      end
end
