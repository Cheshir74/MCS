class CreateHomes < ActiveRecord::Migration[6.0]
  def change
    create_table :homes do |t|
      t.string :title
      t.text :body
      t.timestamps
    end
    add_column :homes, :gallery_id, :integer
    add_column :galleries, :visible, :boolean
    add_column :homes, :visible, :boolean

  end
end
