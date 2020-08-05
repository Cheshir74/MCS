class Admin::AdminController < ApplicationController
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to home_path, :alert => exception.message
  end
  authorize_resource
  layout "admin"

  def index

  end

  def show

  end


  protected

  def check_admin
    redirect_to root_path, alert: "You haven't permission Admin"
  end
end