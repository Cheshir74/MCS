class AddVisibleCfToHomes < ActiveRecord::Migration[8.0]
  def change
    add_column :homes, :visible_cf, :boolean
  end
end
