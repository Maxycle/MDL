# frozen_string_literal: true
module Api
  module Users
		class RegistrationsController < Devise::RegistrationsController
			include RackSessionFix
			include Devise::Controllers::Helpers
			respond_to :json

			wrap_parameters :user, include: [:email, :password]
			before_action :configure_permitted_parameters, only: [:create, :update]
			# before_action :validate_signup_token, only: [:create]
			skip_before_action :authenticate_user!, only: [:create, :confirm]
			
			# Validates the signup token before allowing access to signup
      def validate_signup_token
        token = params[:token]

        # Find the account creation request with this token
        @account_request = AccountCreationRequest.find_by(validation_token: token)
        
        if @account_request && @account_request.validated && !@account_request.token_used_for_signup
          # Token is valid and not yet used for signup
					render json: { 
            email: @account_request.email
          }
          true
        else
          # Invalid token, already used, or account request not validated
          render json: { 
            success: false, 
            message: "Invalid or expired signup link" 
          }, status: :unauthorized
          false
        end
      end

			def create
				# Extract user parameters
				user_params = params.require(:user).permit(:email, :password, :username, :first_name, :last_name, :intro)
				
				 # If we have a token and validated email, enforce it
				 token = params[:token]
				 @account_request = AccountCreationRequest.find_by(validation_token: token)
				 @validated_email = @account_request.email

				 if token.present? && @validated_email.present?
					 # Override the email with the one from the account request to prevent tampering
					 user_params[:email] = @validated_email
				 end

				build_resource(user_params)
			
				if resource.save
					# If we used a token, mark it as used
          if @account_request
            @account_request.update(token_used_for_signup: true)
          end
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

			def destroy
				resource.destroy
				Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
				render json: { message: "Account successfully deleted" }, status: :ok
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
				devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :username, :first_name, :last_name, :intro])
				devise_parameter_sanitizer.permit(:account_update, keys: [:username, :first_name, :last_name, :certification_is_public, :email, :password, :password_confirmation, :current_password, :wantsToBecomePP])
			end

			def generate_validation_token
				self.validation_token = SecureRandom.urlsafe_base64(32)
				self.token_created_at = Time.current
			end
		end
	end
end