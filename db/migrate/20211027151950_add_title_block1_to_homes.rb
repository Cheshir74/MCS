class AddTitleBlock1ToHomes < ActiveRecord::Migration[6.1]
  def change
    add_column :homes, :title_block1, :string
    add_column :homes, :body_block1, :string
  end
end
