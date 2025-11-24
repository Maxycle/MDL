class AddUserToResources < ActiveRecord::Migration[7.0]
  def change
    add_reference :resources, :user, null: false, foreign_key: true
  end
end
