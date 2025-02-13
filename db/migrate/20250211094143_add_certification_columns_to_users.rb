class AddCertificationColumnsToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :certification_is_public, :boolean, default: true
    add_column :users, :certification, :string, default: "not certified"
  end
end
