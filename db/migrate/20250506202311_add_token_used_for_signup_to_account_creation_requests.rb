class AddTokenUsedForSignupToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :account_creation_requests, :token_used_for_signup, :boolean, default: false
  end
end
