class QuestionnaireParamsController < ApplicationController
  def index
    @questionnaire_params = QuestionnaireParam.first

		render json: @questionnaire_params
  end

	# PATCH/PUT /questionnaire_params/1
	def update
		@questionnaire_params = QuestionnaireParam.first
    if @questionnaire_params.update(questionnaire_param_params)
      render json: @questionnaire_params, status: 200
    else
      render :edit
    end
  end

	private

    # # Use callbacks to share common setup or constraints between actions.
    # def set_questionnaire_param
    #   @questionnaire_params = QuestionnaireParam.find(params[:id])
    # end

    # Only allow a list of trusted parameters through.
    def questionnaire_param_params
      params.require(:questionnaire_params).permit(:tries_permitted, :try_length, :cycle_length, :low_threshold, :mid_threshold, :high_threshold, :welcome_start, :welcome_end, :intro, :nb_questions_per_questionnaire, :questionnaire_time_limit)
		end
end
