class AddPagesEnabledToSiteSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :site_settings, :pages_enabled, :boolean, default: true, null: false
  end
end
