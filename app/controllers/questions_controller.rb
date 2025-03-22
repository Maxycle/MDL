class QuestionsController < ApplicationController
  before_action :set_question, only: [:show, :update, :destroy]

	def index
		base_query = Question.includes(:answers)
		base_query = base_query.where(domain: params[:domain]) if params[:domain].present?
		base_query = base_query.where(level: params[:level]) if params[:level].present?
		
		nb_questions = QuestionnaireParam.first.nb_questions_per_questionnaire
		
		# First, ensure we have at least one question from each difficulty level
		low_questions = base_query.where(difficulty: 'LOW').to_a.shuffle.first(1)
		mid_questions = base_query.where(difficulty: 'MID').to_a.shuffle.first(1)
		high_questions = base_query.where(difficulty: 'HIGH').to_a.shuffle.first(1)
		
		# Calculate how many more questions we need to reach the total
		remaining_count = [nb_questions - 3, 0].max
		
		# Get the IDs of questions we've already selected
		selected_ids = (low_questions + mid_questions + high_questions).map(&:id)
		
		# Get remaining questions, excluding the ones we've already selected
		remaining_questions = base_query.where.not(id: selected_ids).to_a.shuffle.first(remaining_count)
		
		# Combine all selected questions
		@questions = low_questions + mid_questions + high_questions + remaining_questions
		
		# Shuffle again to mix the difficulties
		@questions.shuffle!
		
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
