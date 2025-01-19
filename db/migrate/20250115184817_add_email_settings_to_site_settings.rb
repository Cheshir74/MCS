class AddEmailSettingsToSiteSettings < ActiveRecord::Migration[7.2]
  def change
    add_column :site_settings, :email_login, :string
    add_column :site_settings, :email_domain, :string
    add_column :site_settings, :email_contact, :string
    add_column :site_settings, :email_address, :string
    add_column :site_settings, :email_port, :string
    add_column :site_settings, :email_password, :string
    add_column :site_settings, :email_ssl, :boolean
    add_column :site_settings, :email_tls, :boolean
  end
end
