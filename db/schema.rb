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

ActiveRecord::Schema[8.1].define(version: 2026_05_08_010200) do
  create_table "machines", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.string "status"
    t.datetime "updated_at", null: false
    t.float "x"
    t.float "y"
    t.float "z"
  end

  create_table "warehouse_items", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "location"
    t.string "material"
    t.string "name"
    t.integer "quantity"
    t.string "unit"
    t.datetime "updated_at", null: false
  end

  create_table "warehouse_transactions", force: :cascade do |t|
    t.string "action", default: "take", null: false
    t.datetime "created_at", null: false
    t.string "item_name_snapshot", null: false
    t.integer "quantity_changed", default: 1, null: false
    t.datetime "updated_at", null: false
    t.string "user_name", null: false
    t.integer "warehouse_item_id", null: false
    t.index ["warehouse_item_id"], name: "index_warehouse_transactions_on_warehouse_item_id"
  end

  add_foreign_key "warehouse_transactions", "warehouse_items"
end
