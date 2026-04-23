class AddStatusToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :account_creation_requests, :status, :integer, default: 0, null: false
  end
end
