class CreateHomes < ActiveRecord::Migration[6.0]
  def change
    create_table :homes do |t|
      add_column :homes, :title, :string
      add_column :homes, :body, :text
      t.timestamps
    end
  end
end
