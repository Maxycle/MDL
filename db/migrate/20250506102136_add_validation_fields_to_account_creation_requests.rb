class AddValidationFieldsToAccountCreationRequests < ActiveRecord::Migration[6.1]
  def change
    add_column :account_creation_requests, :validated, :boolean, default: false
    add_column :account_creation_requests, :validation_token, :string
    add_column :account_creation_requests, :token_created_at, :datetime
    
    add_index :account_creation_requests, :validation_token, unique: true, if_not_exists: true
  end
end