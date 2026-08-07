class Admin::UsersController < Admin::AdminController
  before_action :set_user, :only => [ :edit, :change_password, :update, :destroy ]

  def index
    @users = User.order(updated_at: :desc)
  end

  def update
    proposed_roles = normalized_user_params
    if self_access_downgrade?(@user, proposed_roles)
      @user.assign_attributes(user_params)
      @user.errors.add(:base, self_access_downgrade_message(@user, proposed_roles))
      return render('edit', status: :unprocessable_entity)
    end

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
    return redirect_to(admin_users_path, alert: "You cannot delete the current account.") if current_user == @user

    if @user.destroy
      redirect_to admin_users_path, notice: "User deleted."
    else
      redirect_to admin_users_path, alert: @user.errors.full_messages.to_sentence
    end
  end

  def bulk_update
    user_ids = selected_user_ids
    return redirect_to(admin_users_path, alert: "Select at least one user.") if user_ids.empty?

    users = User.where(id: user_ids)

    case params[:bulk_operation]
    when "set_role"
      role_key = params[:role_preset].to_s
      attributes = bulk_role_attributes(role_key)
      return redirect_to(admin_users_path, alert: "Choose a role preset first.") if attributes.blank?
      return redirect_to(admin_users_path, alert: self_access_downgrade_message(current_user, attributes)) if current_user.present? && user_ids.include?(current_user.id) && self_access_downgrade?(current_user, attributes)

      updated_count = 0
      failures = []
      users.find_each do |user|
        if user.update(attributes)
          updated_count += 1
        else
          failures.concat(user.errors.full_messages)
        end
      end

      flash_options = {}
      flash_options[:notice] = "Updated #{updated_count} user#{'s' unless updated_count == 1}." if updated_count.positive?
      flash_options[:alert] = failures.uniq.to_sentence if failures.any?
      redirect_to admin_users_path, flash_options.presence || { alert: "No users were updated." }
    when "delete"
      selected_current_user = current_user.present? && user_ids.include?(current_user.id)
      users = users.where.not(id: current_user.id) if selected_current_user
      return redirect_to(admin_users_path, alert: "You cannot delete the current account from the list.") if users.empty?

      deleted_count = 0
      failures = []

      users.find_each do |user|
        if user.destroy
          deleted_count += 1
        else
          failures.concat(user.errors.full_messages)
        end
      end

      flash_options = {}
      flash_options[:notice] = "Deleted #{deleted_count} user#{'s' unless deleted_count == 1}." if deleted_count.positive?
      alert_messages = []
      alert_messages << "Current account was skipped." if selected_current_user
      alert_messages << failures.uniq.to_sentence if failures.any?
      flash_options[:alert] = alert_messages.join(" ") if alert_messages.any?
      redirect_to admin_users_path, flash_options.presence || { alert: "No users were deleted." }
    else
      redirect_to admin_users_path, alert: "Choose a bulk action first."
    end
  end

  private
  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:user_role, :supervisor_role, :superadmin_role)
  end

  def normalized_user_params
    user_params.to_h.symbolize_keys.transform_values do |value|
      ActiveModel::Type::Boolean.new.cast(value)
    end
  end

  def selected_user_ids
    Array(params[:user_ids]).reject(&:blank?).map(&:to_i).uniq
  end

  def bulk_role_attributes(role_key)
    case role_key
    when "viewer"
      { superadmin_role: false, supervisor_role: false, user_role: true }
    when "editor"
      { superadmin_role: false, supervisor_role: true, user_role: false }
    when "superadmin"
      { superadmin_role: true, supervisor_role: false, user_role: false }
    else
      nil
    end
  end

  def self_access_downgrade?(user, attributes)
    return false unless current_user == user

    removes_admin_access = user_has_admin_access?(user) && !admin_access_after_update?(user, attributes)
    removes_last_superadmin = user.superadmin_role? && last_superadmin?(user) && !superadmin_after_update?(user, attributes)

    removes_admin_access || removes_last_superadmin
  end

  def self_access_downgrade_message(user, attributes)
    if user.superadmin_role? && last_superadmin?(user) && !superadmin_after_update?(user, attributes)
      "You cannot remove superadmin access from the last superadmin."
    else
      "You cannot remove your own admin access."
    end
  end

  def user_has_admin_access?(user)
    user.superadmin_role? || user.supervisor_role?
  end

  def admin_access_after_update?(user, attributes)
    attributes.fetch(:superadmin_role, user.superadmin_role?) || attributes.fetch(:supervisor_role, user.supervisor_role?)
  end

  def superadmin_after_update?(user, attributes)
    attributes.fetch(:superadmin_role, user.superadmin_role?)
  end

  def last_superadmin?(user)
    user.superadmin_role? && User.where(superadmin_role: true).where.not(id: user.id).none?
  end
end
