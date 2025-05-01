class AddEmailDetailsToAccountCreationRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :account_creation_requests, :email_sent, :boolean, default: false
    add_column :account_creation_requests, :email_sent_at, :datetime
  end
end
