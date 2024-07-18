class QuestionnaireParamsController < ApplicationController
  def index
    @questionnaire_params = QuestionnaireParam.all

		render json: @questionnaire_params
  end

	# PATCH/PUT /questionnaire_params/1
	def update
		@questionnaire_params = QuestionnaireParam.all
    if @questionnaire_params.update(questionnaire_param_params)
      render json: @questionnaire_params, notice: 'Questionnaire param was successfully updated.'
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
      params.require(:questionnaire_params).permit(:tries_permitted, :try_length, :cycle_length, :threshold)
		end
end
