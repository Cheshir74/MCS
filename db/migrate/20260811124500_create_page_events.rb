class CreatePageEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :page_events do |t|
      t.references :page_view, null: false, foreign_key: true
      t.string :event_type, null: false
      t.string :path, null: false
      t.decimal :x_percent, precision: 6, scale: 3
      t.decimal :y_percent, precision: 6, scale: 3
      t.integer :scroll_percent
      t.integer :viewport_width
      t.integer :viewport_height
      t.string :element_name
      t.string :element_label
      t.datetime :occurred_at, null: false

      t.timestamps
    end

    add_index :page_events, :event_type
    add_index :page_events, :path
    add_index :page_events, :occurred_at
  end
end
