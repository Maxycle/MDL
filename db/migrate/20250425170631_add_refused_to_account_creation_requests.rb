class AddRefusedToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :account_creation_requests, :refused, :boolean, default: false
  end
end
