# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_08_11_124500) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.integer "position", default: 0
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "articles", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "comments", force: :cascade do |t|
    t.string "username"
    t.text "body"
    t.bigint "article_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id"], name: "index_comments_on_article_id"
  end

  create_table "galleries", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "visible"
    t.jsonb "homepage_settings", default: {}, null: false
  end

  create_table "homes", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title_block1"
    t.text "body_block1"
    t.integer "gallery_id"
    t.boolean "visible"
    t.boolean "visible_cf"
    t.text "section_order"
    t.string "design_variant", default: "legacy", null: false
    t.jsonb "editorial_settings", default: {}, null: false
    t.bigint "editorial_lead_gallery_id"
    t.bigint "editorial_feature_gallery_id"
    t.bigint "editorial_compact_left_gallery_id"
    t.bigint "editorial_compact_right_gallery_id"
    t.bigint "editorial_series_first_gallery_id"
    t.bigint "editorial_series_second_gallery_id"
    t.bigint "editorial_series_third_gallery_id"
    t.index ["editorial_compact_left_gallery_id"], name: "index_homes_on_editorial_compact_left_gallery_id"
    t.index ["editorial_compact_right_gallery_id"], name: "index_homes_on_editorial_compact_right_gallery_id"
    t.index ["editorial_feature_gallery_id"], name: "index_homes_on_editorial_feature_gallery_id"
    t.index ["editorial_lead_gallery_id"], name: "index_homes_on_editorial_lead_gallery_id"
    t.index ["editorial_series_first_gallery_id"], name: "index_homes_on_editorial_series_first_gallery_id"
    t.index ["editorial_series_second_gallery_id"], name: "index_homes_on_editorial_series_second_gallery_id"
    t.index ["editorial_series_third_gallery_id"], name: "index_homes_on_editorial_series_third_gallery_id"
  end

  create_table "images", force: :cascade do |t|
    t.string "image"
    t.string "image_title"
    t.string "image_file_size"
    t.string "image_content_type"
    t.string "image_description"
    t.integer "gallery_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "page_events", force: :cascade do |t|
    t.bigint "page_view_id", null: false
    t.string "event_type", null: false
    t.string "path", null: false
    t.decimal "x_percent", precision: 6, scale: 3
    t.decimal "y_percent", precision: 6, scale: 3
    t.integer "scroll_percent"
    t.integer "viewport_width"
    t.integer "viewport_height"
    t.string "element_name"
    t.string "element_label"
    t.datetime "occurred_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_type"], name: "index_page_events_on_event_type"
    t.index ["occurred_at"], name: "index_page_events_on_occurred_at"
    t.index ["page_view_id"], name: "index_page_events_on_page_view_id"
    t.index ["path"], name: "index_page_events_on_path"
  end

  create_table "page_views", force: :cascade do |t|
    t.string "visitor_id", null: false
    t.string "path", null: false
    t.string "full_path", null: false
    t.string "controller_name"
    t.string "action_name"
    t.string "referrer"
    t.string "user_agent"
    t.string "ip_hash"
    t.datetime "started_at", null: false
    t.integer "duration_seconds"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["path"], name: "index_page_views_on_path"
    t.index ["started_at"], name: "index_page_views_on_started_at"
    t.index ["visitor_id"], name: "index_page_views_on_visitor_id"
  end

  create_table "pages", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "site_settings", force: :cascade do |t|
    t.string "name_site", default: "My Site Photography", null: false
    t.string "footer", default: "Copyright © 2025 Dmitry Tolstosheev. All rights reserved.", null: false
    t.string "yn_verification_pri", default: "", null: false
    t.string "yn_verification_sec", default: "", null: false
    t.string "fb_url", default: "", null: false
    t.string "inst_url", default: "", null: false
    t.string "vk_url", default: "", null: false
    t.boolean "fb_visible", default: false
    t.boolean "vk_visible", default: false
    t.boolean "inst_visible", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email_login"
    t.string "email_domain"
    t.string "email_contact"
    t.string "email_address"
    t.string "email_port"
    t.string "email_password"
    t.boolean "email_ssl"
    t.boolean "email_tls"
    t.string "tg_url", default: "", null: false
    t.boolean "pages_enabled", default: true, null: false
    t.boolean "registrations_enabled", default: true, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "superadmin_role", default: false
    t.boolean "supervisor_role", default: false
    t.boolean "user_role", default: true
    t.string "pending_email"
    t.string "email_change_code_digest"
    t.datetime "email_change_code_sent_at"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "comments", "articles"
  add_foreign_key "homes", "galleries", column: "editorial_compact_left_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_compact_right_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_feature_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_lead_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_series_first_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_series_second_gallery_id"
  add_foreign_key "homes", "galleries", column: "editorial_series_third_gallery_id"
  add_foreign_key "page_events", "page_views"
end
