class AddIntroToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :intro, :text
  end
end
