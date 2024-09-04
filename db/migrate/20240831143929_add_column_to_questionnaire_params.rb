class AddColumnToQuestionnaireParams < ActiveRecord::Migration[7.0]
  def change
    add_column :questionnaire_params, :questionnaire_time_limit, :integer
  end
end
