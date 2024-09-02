class AddColumnsToQuestionnaireParams < ActiveRecord::Migration[7.0]
  def change
    add_column :questionnaire_params, :intro, :text
    add_column :questionnaire_params, :welcome_start, :text
    add_column :questionnaire_params, :welcome_end, :text
    add_column :questionnaire_params, :nb_questions_per_questionnaire, :integer
  end
end
