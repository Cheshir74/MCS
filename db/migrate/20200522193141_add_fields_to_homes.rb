class AddFieldsToHomes < ActiveRecord::Migration[6.0]
  def change
    add_column :homes, :title, :string
    add_column :homes, :body, :text
    add_column :homes, :image, :string
    add_column :homes, :image_file_size, :string
    add_column :homes, :image_content_type, :string
  end
end
