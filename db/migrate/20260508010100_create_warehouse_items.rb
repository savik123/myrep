class CreateWarehouseItems < ActiveRecord::Migration[8.1]
  def change
    create_table :warehouse_items do |t|
      t.string :name
      t.string :category
      t.string :material
      t.integer :quantity
      t.string :unit
      t.string :location
      t.text :description

      t.timestamps
    end
  end
end