class AddConfirmedByAdminIdToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :confirmed_by_admin_id, :integer
  end
end
