class AddSectionOrderToHomes < ActiveRecord::Migration[8.0]
  def change
    add_column :homes, :section_order, :text
  end
end
