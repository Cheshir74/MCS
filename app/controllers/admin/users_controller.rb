class Admin::UsersController < Admin::AdminController
  before_action :set_user, :only => [ :edit, :change_password, :update, :destroy ]
  before_action :set_user, :only => [ :send_email_change_code, :confirm_email_change ]

  def index
    @users = User.order(updated_at: :desc)
  end

  def update
    proposed_roles = normalized_role_params
    update_attributes = account_params.merge(proposed_roles)
    if self_access_downgrade?(@user, proposed_roles)
      @user.assign_attributes(update_attributes)
      @user.errors.add(:base, self_access_downgrade_message(@user, proposed_roles))
      return render('edit', status: :unprocessable_entity)
    end

    if @user.update(update_attributes)
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

  def send_email_change_code
    next_email = User.normalize_email(params[:email])

    if next_email.blank?
      return render json: { error: "Enter a new email address." }, status: :unprocessable_entity
    end

    if next_email == @user.email.to_s.downcase
      return render json: { error: "This is already the current email." }, status: :unprocessable_entity
    end

    unless next_email.match?(URI::MailTo::EMAIL_REGEXP)
      return render json: { error: "Enter a valid email address." }, status: :unprocessable_entity
    end

    if email_taken_or_reserved?(next_email)
      return render json: { error: "This email is already in use." }, status: :unprocessable_entity
    end

    raw_code = @user.prepare_email_change!(next_email)

    begin
      UserMailer.admin_email_change_code(@user, next_email, raw_code).deliver_now
      render json: {
        message: "Verification code sent.",
        pending_email: next_email,
        expires_in_minutes: (User::EMAIL_CHANGE_CODE_TTL / 60).to_i
      }, status: :ok
    rescue StandardError => e
      Rails.logger.error("admin email change send failed for user=#{@user.id}: #{e.class} #{e.message}")
      @user.clear_pending_email_change!
      render json: { error: "Could not send the verification code." }, status: :unprocessable_entity
    end
  end

  def confirm_email_change
    unless @user.pending_email_change?
      return render json: { error: "Request a verification code first." }, status: :unprocessable_entity
    end

    if @user.email_change_code_expired?
      @user.clear_pending_email_change!
      return render json: { error: "The code expired. Send a new one." }, status: :unprocessable_entity
    end

    if @user.confirm_pending_email_change!(params[:code].to_s)
      render json: { message: "Email updated.", email: @user.email }, status: :ok
    else
      error_message = @user.errors.full_messages.to_sentence.presence || "Invalid verification code."
      render json: { error: error_message }, status: :unprocessable_entity
    end
  end


  def edit
    @user ||= User.find(params[:id])
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

  def role_params
    params.require(:user).permit(:user_role, :supervisor_role, :superadmin_role)
  end

  def normalized_role_params
    normalized = role_params.to_h.symbolize_keys.transform_values do |value|
      ActiveModel::Type::Boolean.new.cast(value)
    end
    apply_role_hierarchy(normalized)
  end

  def account_params
    params.require(:user).permit(:email).to_h.symbolize_keys.transform_values do |value|
      value.is_a?(String) ? value.strip : value
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
      { superadmin_role: false, supervisor_role: true, user_role: true }
    when "superadmin"
      { superadmin_role: true, supervisor_role: true, user_role: true }
    else
      nil
    end
  end

  def apply_role_hierarchy(attributes)
    normalized = attributes.symbolize_keys

    if normalized[:superadmin_role]
      normalized[:supervisor_role] = true
      normalized[:user_role] = true
    elsif normalized[:supervisor_role]
      normalized[:user_role] = true
    end

    normalized
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

  def email_taken_or_reserved?(email_value)
    normalized_email = email_value.to_s.downcase

    User.where.not(id: @user.id)
        .where("LOWER(email) = :value OR LOWER(COALESCE(pending_email, '')) = :value", value: normalized_email)
        .exists?
  end
end
