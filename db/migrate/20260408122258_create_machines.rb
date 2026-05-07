class CreateMachines < ActiveRecord::Migration[8.1]
  def change
    create_table :machines do |t|
      t.string :name
      t.text :description
      t.string :status
      t.float :x
      t.float :y
      t.float :z

      t.timestamps
    end
  end
end
