class CreateVisitors < ActiveRecord::Migration[7.0]
  def change
    create_table :visitors do |t|
      t.string :email, null: false
      t.integer :tries, default: 0

      t.timestamps
    end
    add_index :visitors, :email, unique: true
  end
end
