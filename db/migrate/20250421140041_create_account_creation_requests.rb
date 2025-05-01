class CreateAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    create_table :account_creation_requests do |t|
      t.string :email, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
			t.integer :approval_ids, array: true, default: []
			t.text :motivations, null: false
			t.integer :referencer, default: nil

      t.timestamps
    end
    add_index :account_creation_requests, :email, unique: true
  end
end
