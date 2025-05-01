# frozen_string_literal: true
# module Api
  module Admin
    class UsersController < ApplicationController
      before_action :authenticate_user!  # Ensure admin is logged in
      before_action :authorize_admin!  # Ensure only admins can confirm users
			before_action :set_user, only: [:give_admin_status, :remove_admin_status, :update_certification, :destroy]

      def give_admin_status
        if @user.nil?
          return render json: { error: "User not found" }, status: :not_found
        end

				@user.update(admin: true)

        render json: { message: "User is now admin" }, status: :ok
      end

			def remove_admin_status
        if @user.nil?
          return render json: { error: "User not found" }, status: :not_found
        end

				@user.update(admin: false)

        render json: { message: "User is not admin anymore" }, status: :ok
      end

			def update_certification
				if @user.nil?
					return render json: { error: "User not found" }, status: :not_found
				end
				
				# Get the certification from params
				new_certification = params[:certification]
				
				@user.update(certification: new_certification)
				render json: { message: "Certification updated successfully" }, status: :ok
			end

			def destroy
				if @user.destroy
					render json: { message: "User successfully deleted" }, status: :ok
				else
					render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
				end
			end

      private

			def set_user
				@user = User.find(params[:id])
			end

      def authorize_admin!
        unless current_user&.admin? # Assuming you have an `admin?` method in User model
          render json: { error: "Unauthorized" }, status: :forbidden
        end
      end
    end
  end
# end
