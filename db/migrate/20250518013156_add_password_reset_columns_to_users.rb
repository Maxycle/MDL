class AddPasswordResetColumnsToUsers < ActiveRecord::Migration[6.1]
  def change
    # Add reset_password_token column if not exists
    unless column_exists?(:users, :reset_password_token)
      add_column :users, :reset_password_token, :string
      add_index :users, :reset_password_token, unique: true
    end
    
    # Add reset_password_sent_at column if not exists
    unless column_exists?(:users, :reset_password_sent_at)
      add_column :users, :reset_password_sent_at, :datetime
    end
  end
end