class Admin::UsersController < Admin::AdminController
  before_action :set_user, :only => [ :edit, :change_password, :update, :destroy ]

  def index
    @users = User.order(updated_at: :desc)
  end

  def update
    if @user.update(user_params)
      flash[:notice] = "User updated"
      redirect_to edit_admin_user_path(params[:id])
    else
      render 'edit'
    end
  end

  def change_password
    @user = User.find(params[:id])

    if @user.valid_password?(params[:current_password])
      if @user.update(password: params[:new_password], password_confirmation: params[:new_password_confirmation])
        render json: { message: "Пароль успешно изменён" }, status: :ok
      else
        render json: { error: @user.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    else
      render json: { error: "Неверный текущий пароль" }, status: :unauthorized
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
