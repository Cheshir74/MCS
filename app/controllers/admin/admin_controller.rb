class Admin::AdminController < ApplicationController


  protected

  def check_admin
    redirect_to root_path, alert: "You haven't permission Admin" unless current_user.supervisor_role?
  end
end