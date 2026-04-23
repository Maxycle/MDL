class RemoveRefusedAndValidatedFromAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    remove_column :account_creation_requests, :refused, :boolean
    remove_column :account_creation_requests, :validated, :boolean
  end
end