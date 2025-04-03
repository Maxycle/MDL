class UsersController < ApplicationController
	skip_before_action :authenticate_user!, only: [:index, :index_admin]
	before_action :authenticate_user!, except: [:index, :index_admin] # Ensure the user is authenticated
	before_action :set_user, only: [:show, :destroy]

  def index
		@users = User.includes(:scores).where.not(confirmed_by_admin_id: nil)
		render json: @users.as_json(include: :scores)
  end

	def index_unconfirmed
		@unconfirmed_users = User.where(confirmed_by_admin_id: nil)
		render json: @unconfirmed_users.as_json
	end
	
	def index_admin
		@users = User.where(admin: true)
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
