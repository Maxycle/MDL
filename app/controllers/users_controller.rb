class UsersController < ApplicationController
	before_action :authenticate_user! # Ensure the user is authenticated
	before_action :set_user, only: [:show, :destroy]

  def index
		@users = User.includes(:scores)
		render json: @users.as_json(include: :scores)
  end

	def show
		render json: @user
	end

	private

  def set_user
    @user = User.find(params[:id])
  end
end
