class Admin::AdminController < ApplicationController
  layout "admin"

  def index

  end

  def show

  end


  protected

  def check_admin
    redirect_to root_path, alert: "You haven't permission Admin" unless current_user.supervisor_role?
  end
end