class UsersController < ApplicationController
	skip_before_action :authenticate_user!, only: [:index]
	before_action :authenticate_user!, except: [:index] # Ensure the user is authenticated
	before_action :set_user, only: [:show, :destroy]

  def index
		@users = User.includes(:scores)
		render json: @users.as_json(include: :scores)
  end
	
	def index_pp
		@users = User.pp_users
		render json: @users.as_json(only: [:id, :first_name, :last_name, :username])
	end

	def show
		render json: @user.as_json(include: :scores)
	end

	private

	def set_user
		@user = User.includes(:scores).find(params[:id])
	end
end
