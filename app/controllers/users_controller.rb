class UsersController < ApplicationController
	before_action :authenticate_user! # Ensure the user is authenticated
	before_action :set_user, only: [:show, :destroy]

  def index
		@users = User.includes(:scores)
		render json: @users.as_json(include: :scores)
  end

	def show
		render json: @user.as_json(include: :scores)
	end

	private

	def set_user
		@user = User.includes(:scores).find(params[:id])
	end
end
