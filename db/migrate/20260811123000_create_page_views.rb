class CreatePageViews < ActiveRecord::Migration[8.0]
  def change
    create_table :page_views do |t|
      t.string :visitor_id, null: false
      t.string :path, null: false
      t.string :full_path, null: false
      t.string :controller_name
      t.string :action_name
      t.string :referrer
      t.string :user_agent
      t.string :ip_hash
      t.datetime :started_at, null: false
      t.integer :duration_seconds

      t.timestamps
    end

    add_index :page_views, :visitor_id
    add_index :page_views, :path
    add_index :page_views, :started_at
  end
end
