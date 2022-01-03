class MessagesController < ApplicationController
    skip_before_action :authenticate_user!, :only => [:new, :create]

    def new
        @message = Message.new
    end

    def create
        name = params[:name]
        email = params[:email]
        body = params[:body]
        MessageMailer.contact_email(name, email, body).deliver
        render :json => {:status => "ok"}
    end

end
