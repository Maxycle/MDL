class AddDefaultToQuestionnaireTimeLimitInQuestionnaireParams < ActiveRecord::Migration[7.0]
  def change
		change_column_default :questionnaire_params, :questionnaire_time_limit, 30
  end
end
