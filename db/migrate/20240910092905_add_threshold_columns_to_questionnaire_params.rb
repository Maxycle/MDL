class AddThresholdColumnsToQuestionnaireParams < ActiveRecord::Migration[7.0]
  def change
    add_column :questionnaire_params, :low_threshold, :integer, default: 90
    add_column :questionnaire_params, :mid_threshold, :integer, default: 80
    add_column :questionnaire_params, :high_threshold, :integer, default: 70
  end
end
