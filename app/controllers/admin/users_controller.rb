# frozen_string_literal: true
# module Api
  module Admin
    class UsersController < ApplicationController
      before_action :authenticate_user!  # Ensure admin is logged in
      before_action :authorize_admin!  # Ensure only admins can confirm users

      def confirm
        user = User.find_by(id: params[:id])

        if user.nil?
          return render json: { error: "User not found" }, status: :not_found
        end

        if user.confirmed_by_admin_id.present?
          return render json: { error: "User is already confirmed" }, status: :unprocessable_entity
        end

        user.confirm_by_admin!(current_user)

        render json: { message: "User confirmed successfully", confirmed_by: current_user.email }, status: :ok
      end

			def update_certification
				user = User.find_by(id: params[:id])
				if user.nil?
					return render json: { error: "User not found" }, status: :not_found
				end
				
				# Get the certification from params
				new_certification = params[:certification]
				
				user.update(certification: new_certification)
				render json: { message: "Certification updated successfully" }, status: :ok
			end

      private

      def authorize_admin!
        unless current_user&.admin? # Assuming you have an `admin?` method in User model
          render json: { error: "Unauthorized" }, status: :forbidden
        end
      end
    end
  end
# end
