class AddWantsToBecomePpToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :wantsToBecomePP, :boolean, default: false, null: false
  end
end
