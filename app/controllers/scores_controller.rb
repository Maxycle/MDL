class ScoresController < ApplicationController
  before_action :set_score, only: %i[show update destroy]

  # GET /scores
  def index
    @scores = Score.all
    render json: @scores
  end

	def user_scores
		@scores = Score.all
		@scores = @scores.where(user_id: params[:user_id]) if params[:user_id].present?
    render json: @scores
	end
  # GET /scores/1
  def show
    render json: @score
  end

  # POST /scores
  def create
    @score = Score.new(score_params)
    @score.try_date = Time.current

    if @score.save
			@score.update(try_date: @score.created_at)
      render json: @score, status: :created, location: @score
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /scores/1
  def update
    if @score.update(score_params)
      render json: @score
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  # DELETE /scores/1
  def destroy
    @score.destroy
  end 

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_score
    @score = Score.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def score_params
    params.require(:score).permit(:domain, :level, :step, :user_id, :try_date)
  end
end
