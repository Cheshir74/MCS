class CreateSiteSettings < ActiveRecord::Migration[7.2]
  def change
    create_table :site_settings do |t|
      t.string :name_site, null: false, default: 'My Site Photography'
      t.string :footer, null: false, default: 'Copyright © 2025 Dmitry Tolstosheev. All rights reserved.'
      t.string :yn_verification_pri, null: false, default: ''
      t.string :yn_verification_sec, null: false, default: ''
      t.string :fb_url, null: false, default: ''
      t.string :inst_url, null: false, default: ''
      t.string :vk_url, null: false, default: ''
      t.boolean :fb_visible, default: false
      t.boolean :vk_visible, default: false
      t.boolean :inst_visible, default: false

      t.timestamps
    end
  end
end
