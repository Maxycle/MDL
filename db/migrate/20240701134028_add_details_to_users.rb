class AddDetailsToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :EA, :string
    add_column :users, :DN, :string
  end
end
