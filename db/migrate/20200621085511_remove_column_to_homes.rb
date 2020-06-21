class RemoveColumnToHomes < ActiveRecord::Migration[6.0]
  def change
    remove_column :homes, :image
    remove_column :homes, :image_file_size
    remove_column :homes, :image_content_type
  end
end
