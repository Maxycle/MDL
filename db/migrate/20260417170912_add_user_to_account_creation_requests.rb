class AddUserToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_reference :account_creation_requests, :user, null: true, foreign_key: true
  end
end
