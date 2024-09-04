class CreateScores < ActiveRecord::Migration[7.0]
  def change
    create_table :scores do |t|
      t.string :domain
      t.string :level, default: "beginner"
			t.integer :step, default: 0
			t.datetime :try_date
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
