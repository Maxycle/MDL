class QuestionsController < ApplicationController
  before_action :set_question, only: [:show, :update, :destroy]

	def index
		@questions = Question.includes(:answers)
		@questions = @questions.where(domain: params[:domain]) if params[:domain].present?
		@questions = @questions.where(level: params[:level]) if params[:level].present?
	
		nb_questions = QuestionnaireParam.first.nb_questions_per_questionnaire
		# Select 5 random questions from the filtered result
		@questions = @questions.shuffle.first(nb_questions)

		render json: @questions.as_json(include: :answers)
	end

	def index_admin
		@questions = Question.includes(:answers)

		render json: @questions.as_json(include: :answers)
	end
	
  # GET /questions/:id
  def show
    render json: @question
  end

  # POST /questions
  def create
    @question = Question.new(question_params)

    if @question.save
      render json: @question, status: :created, location: @question
    else
      render json: @question.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /questions/:id
  def update
    if @question.update(question_params)
      render json: @question
    else
      render json: @question.errors, status: :unprocessable_entity
    end
  end

  # DELETE /questions/:id
  def destroy
    @question.destroy
  end

	def destroy_all
		deleted_count = Question.count
		Question.destroy_all
		
		render json: { 
			message: 'All questions have been deleted', 
			deleted_count: deleted_count 
		}, status: :ok
	rescue => e
		render json: { 
			error: 'Failed to delete all questions', 
			details: e.message 
		}, status: :unprocessable_entity
	end
	
  private

  def set_question
    @question = Question.find(params[:id])
  end

  def question_params
    params.require(:question).permit(:content, :level, :domain, :difficulty, answers_attributes: [:content, :value])
  end
end
