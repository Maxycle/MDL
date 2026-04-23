class AddRefusedByAndBannedByAndBannedToRefusedByToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :account_creation_requests, :refused_by, :integer
    add_column :account_creation_requests, :banned_by, :integer
    add_column :account_creation_requests, :banned_to_refused_by, :integer
  end
end