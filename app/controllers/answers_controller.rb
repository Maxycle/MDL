class AnswersController < ApplicationController
  before_action :set_answer, only: [:show, :update, :destroy]
  before_action :set_question, only: [:index, :create]

  # GET /questions/:question_id/answers
  def index
    @answers = @question.answers
    render json: @answers
  end

  # GET /answers/:id
  def show
    render json: @answer
  end

  # POST /questions/:question_id/answers
  def create
    @answer = @question.answers.new(answer_params)

    if @answer.save
      render json: @answer, status: :created, location: [@question, @answer]
    else
      render json: @answer.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /answers/:id
  def update
    if @answer.update(answer_params)
      render json: @answer
    else
      render json: @answer.errors, status: :unprocessable_entity
    end
  end

  # DELETE /answers/:id
  def destroy
    @answer.destroy
  end

  private

  def set_answer
    @answer = Answer.find(params[:id])
  end

  def set_question
    @question = Question.find(params[:question_id])
  end

  def answer_params
    params.require(:answer).permit(:content, :question_id)
  end
end
