class ChangeStepDefaultInScores < ActiveRecord::Migration[7.0]
  def change
		change_column_default :scores, :step, from: 0, to: 1
    
    # Update existing records with step = 0 to step = 1
    Score.where(step: 0).update_all(step: 1)
  end
end
