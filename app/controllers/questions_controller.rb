class QuestionsController < ApplicationController
  before_action :set_question, only: [:show, :update, :destroy]

	def index
		base_query = Question.includes(:answers)
		base_query = base_query.where(domain: params[:domain]) if params[:domain].present?
		base_query = base_query.where(level: params[:level]) if params[:level].present?
		
		nb_questions = QuestionnaireParam.first.nb_questions_per_questionnaire
		
		# Count total questions and questions per difficulty level
		total_count = base_query.count
		low_count = base_query.where(difficulty: 'LOW').count
		mid_count = base_query.where(difficulty: 'MID').count
		high_count = base_query.where(difficulty: 'HIGH').count
		
		# Calculate proportions
		low_proportion = total_count > 0 ? low_count.to_f / total_count : 0
		mid_proportion = total_count > 0 ? mid_count.to_f / total_count : 0
		high_proportion = total_count > 0 ? high_count.to_f / total_count : 0
		
		# Calculate how many questions to take from each difficulty level
		low_questions_count = (nb_questions * low_proportion).round
		mid_questions_count = (nb_questions * mid_proportion).round
		high_questions_count = (nb_questions * high_proportion).round
		
		# Adjust if the total doesn't match nb_questions due to rounding
		sum = low_questions_count + mid_questions_count + high_questions_count
		if sum < nb_questions
			# Add the remaining questions to the largest group
			if low_count >= mid_count && low_count >= high_count
				low_questions_count += (nb_questions - sum)
			elsif mid_count >= low_count && mid_count >= high_count
				mid_questions_count += (nb_questions - sum)
			else
				high_questions_count += (nb_questions - sum)
			end
		elsif sum > nb_questions
			# Remove questions from the largest group
			if low_questions_count >= mid_questions_count && low_questions_count >= high_questions_count
				low_questions_count -= (sum - nb_questions)
			elsif mid_questions_count >= low_questions_count && mid_questions_count >= high_questions_count
				mid_questions_count -= (sum - nb_questions)
			else
				high_questions_count -= (sum - nb_questions)
			end
		end
		
		# Ensure we don't request more questions than available
		low_questions_count = [low_questions_count, low_count].min
		mid_questions_count = [mid_questions_count, mid_count].min
		high_questions_count = [high_questions_count, high_count].min
		
		# Get random questions from each difficulty level
		low_questions = base_query.where(difficulty: 'LOW').to_a.shuffle.first(low_questions_count)
		mid_questions = base_query.where(difficulty: 'MID').to_a.shuffle.first(mid_questions_count)
		high_questions = base_query.where(difficulty: 'HIGH').to_a.shuffle.first(high_questions_count)
		
		# Combine all selected questions
		@questions = low_questions + mid_questions + high_questions
		
		# If we still don't have enough questions, get more from any difficulty level
		if @questions.length < nb_questions
			remaining_count = nb_questions - @questions.length
			selected_ids = @questions.map(&:id)
			remaining_questions = base_query.where.not(id: selected_ids).to_a.shuffle.first(remaining_count)
			@questions += remaining_questions
		end
		
		# Shuffle to mix the difficulties
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
