class CreateQuestionnaireParams < ActiveRecord::Migration[7.0]
  def change
    create_table :questionnaire_params do |t|
      t.integer :tries_permitted, default: 2
      t.integer :try_length, default: 7
      t.integer :cycle_length, default: 30
			t.integer :threshold, default: 200

      t.timestamps
    end
  end
end
