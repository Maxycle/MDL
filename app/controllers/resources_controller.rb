class ResourcesController < ApplicationController
	# Public actions (no auth required)
	skip_before_action :authenticate_user!, only: [:index, :show]

	# Private actions (auth required)
	before_action :authenticate_user!, only: [:create, :update, :destroy]
	before_action :set_resource, only: [:show]
	before_action :set_owned_resource, only: [:update, :destroy]

	# GET /api/resources
	# Public: anyone can see all resources
	def index
		@resources = Resource.includes(:user).all.order(created_at: :desc)

		render json: @resources.map { |res|
			{
				id: res.id,
				url: res.url,
				content: res.content,
				created: res.created_at,
				author: {
					id: res.user.id,
					username: res.user.username,
					email: res.user.email,
					first_name: res.user.first_name,
					last_name: res.user.last_name
				}
			}
		}
	end
	
	# GET /api/resources/:id
	# Public
	def show
		render json: @resource
	end

	# POST /api/resources
	# Requires login
	def create
		return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user&.admin?

		@resource = current_user.resources.build(resource_params)

		if @resource.save
			render json: @resource, status: :created
		else
			render json: @resource.errors, status: :unprocessable_entity
		end
	end

	# PATCH/PUT /api/resources/:id
	# Only the owner may update
	def update			
		return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user&.admin?
		
		if @resource.update(resource_params)
			render json: @resource
		else
			render json: @resource.errors, status: :unprocessable_entity
		end
	end

	# DELETE /api/resources/:id
	# Only the owner may delete
	def destroy
		@resource.destroy
		head :no_content
	end

	private

	# Used for public actions (index/show)
	def set_resource
		@resource = Resource.find(params[:id])
	end

	# Used for update/delete (must belong to current_user)
	def set_owned_resource
		@resource = current_user.resources.find(params[:id])
	rescue ActiveRecord::RecordNotFound
		render json: { error: "Not authorized" }, status: :forbidden
	end

	def resource_params
		params.require(:resource).permit(:url, :content)
	end
end

