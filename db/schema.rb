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

ActiveRecord::Schema[7.0].define(version: 2025_07_25_135526) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "account_creation_requests", force: :cascade do |t|
    t.string "email", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.integer "approval_ids", default: [], array: true
    t.text "motivations", null: false
    t.integer "referencer"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "email_sent", default: false
    t.datetime "email_sent_at"
    t.boolean "refused", default: false
    t.boolean "validated", default: false
    t.string "validation_token"
    t.datetime "token_created_at", precision: nil
    t.boolean "token_used_for_signup", default: false
    t.index ["email"], name: "index_account_creation_requests_on_email", unique: true
    t.index ["validation_token"], name: "index_account_creation_requests_on_validation_token", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "answers", force: :cascade do |t|
    t.text "content"
    t.bigint "question_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "value"
    t.index ["question_id"], name: "index_answers_on_question_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", precision: nil, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti", unique: true
  end

  create_table "posts", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "questionnaire_params", force: :cascade do |t|
    t.integer "tries_permitted", default: 2
    t.integer "try_length", default: 7
    t.integer "cycle_length", default: 30
    t.integer "threshold", default: 200
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "intro"
    t.text "welcome_start"
    t.text "welcome_end"
    t.integer "nb_questions_per_questionnaire"
    t.integer "questionnaire_time_limit", default: 30
    t.integer "low_threshold", default: 90
    t.integer "mid_threshold", default: 80
    t.integer "high_threshold", default: 70
  end

  create_table "questions", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "domain"
    t.text "level"
    t.text "difficulty"
  end

  create_table "scores", force: :cascade do |t|
    t.string "domain"
    t.string "level", default: "beginner"
    t.integer "step", default: 1
    t.datetime "try_date"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_scores_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "username"
    t.string "jti", null: false
    t.boolean "admin", default: false
    t.boolean "certification_is_public", default: true
    t.string "certification", default: "SM"
    t.text "intro"
    t.boolean "wantsToBecomePP", default: false, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "answers", "questions"
  add_foreign_key "posts", "users"
  add_foreign_key "scores", "users"
end
