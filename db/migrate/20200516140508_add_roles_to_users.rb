class AddRolesToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :superadmin_role, :boolean, default: false
    add_column :users, :supervisor_role, :boolean, default: false
    add_column :users, :user_role, :boolean, default: true

    User.update_all superadmin_role: t
    User.update_all supervisor_role: t

  end
end
