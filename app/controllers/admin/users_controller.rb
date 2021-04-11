class Admin::UsersController < Admin::AdminController
  before_action :set_user, :only => [ :edit, :update, :destroy ]

  def index
    @users = User.all
  end

  def update
    if @user.update(user_params)
      flash[:notice] = "User updated"
      redirect_to edit_admin_user_path(params[:id])
    else
      render 'edit'
    end
  end

  def edit

  end

  def destroy
    @user.destroy
    redirect_to admin_users_path
  end

  private
  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:user_role, :supervisor_role, :superadmin_role)
  end
end
