class AddDifficultyToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :difficulty, :text
  end
end
