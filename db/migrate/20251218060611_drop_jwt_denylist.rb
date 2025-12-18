class DropJwtDenylist < ActiveRecord::Migration[6.1]
  def change
    drop_table :jwt_denylists do |t|
      t.string   :jti, null: false
      t.datetime :exp, null: false
      t.timestamps
    end
  end
end
