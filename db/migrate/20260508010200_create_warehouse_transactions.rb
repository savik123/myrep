class CreateWarehouseTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :warehouse_transactions do |t|
      t.string :user_name, null: false
      t.references :warehouse_item, null: false, foreign_key: true
      t.string :item_name_snapshot, null: false
      t.integer :quantity_changed, null: false, default: 1
      t.string :action, null: false, default: "take"

      t.timestamps
    end
  end
end