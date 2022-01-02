class MessageMailer < ApplicationMailer
    default from: 'noreply@techbuben.ru'

    def contact_email(name, email, body)
        @name = name
        @email = email
        @body = body
        
        mail(to: 'total@techbuben.ru', subject: 'Test')
      end
end
