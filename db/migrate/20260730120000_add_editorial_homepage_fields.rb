class AddEditorialHomepageFields < ActiveRecord::Migration[8.0]
  def change
    add_column :homes, :design_variant, :string, null: false, default: "legacy"
    add_column :homes, :editorial_settings, :jsonb, null: false, default: {}

    add_reference :homes, :editorial_lead_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_feature_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_compact_left_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_compact_right_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_series_first_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_series_second_gallery, foreign_key: { to_table: :galleries }
    add_reference :homes, :editorial_series_third_gallery, foreign_key: { to_table: :galleries }

    add_column :galleries, :homepage_settings, :jsonb, null: false, default: {}
    add_column :site_settings, :tg_url, :string, null: false, default: ""
  end
end
