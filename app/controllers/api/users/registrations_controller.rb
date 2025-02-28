# frozen_string_literal: true
module Api
  module Users
		class RegistrationsController < Devise::RegistrationsController
			include RackSessionFix
			include Devise::Controllers::Helpers
			respond_to :json

			wrap_parameters :user, include: [:email, :password]
			before_action :configure_permitted_parameters, only: [:create, :update]
			skip_before_action :authenticate_user!, only: [:create, :confirm]
			
			def create
				Rails.logger.info("Raw Params: #{request.raw_post}")
				Rails.logger.info("Processed Params: #{params.inspect}")
			
				# Extract user parameters
				user_params = params.require(:user).permit(:email, :password, :username, :first_name, :last_name, :intro, :selected_admin_id)
				
				build_resource(user_params)
			
				if resource.save
					register_success
				else
					register_failed(resource.errors.full_messages)
				end
			end

			def update
				self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
				
				resource_updated = update_resource(resource, account_update_params)
				if resource_updated
					# Skip bypass_sign_in to avoid session storage issues with JWT
					render json: { success: true, user: resource }, status: :ok
				else
					render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
				end
			end

			def confirm
        self.resource = resource_class.confirm_by_token(params[:confirmation_token])
      
        if resource.errors.empty?
          render json: { message: 'Your email has been confirmed successfully.' }, status: :ok
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end

			private

			def set_flash_message(_key, _kind, _options); end

			def respond_with(resource, _opts = {})
				if resource.persisted?
					register_success
				else
					message = resource.errors.full_messages.any? ? resource.errors.full_messages : "Something went wrong."
					register_failed(message)
				end
			end

			def register_success
				render json: {
					message: "Signed up successfully.",
					user: resource
				}, status: :ok
			end

			def register_failed(message)
				Rails.logger.error "Update failed with errors: #{message}"
				render json: { message: "Signing up failed", errors: message }, status: :unprocessable_entity
			end

			def configure_permitted_parameters
				devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :username, :first_name, :last_name, :intro, :selected_admin_id])
				devise_parameter_sanitizer.permit(:account_update, keys: [:username, :first_name, :last_name, :certification_is_public, :email, :password, :password_confirmation, :current_password])
			end
		end
	end
end