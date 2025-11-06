class ChangeBodyBlock1ToTextOnHomes < ActiveRecord::Migration[8.0]
  def up
    change_column :homes, :body_block1, :text
  end

  def down
    change_column :homes, :body_block1, :string
  end
end
