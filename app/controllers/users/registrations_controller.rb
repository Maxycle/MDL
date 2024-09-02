# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
	include RackSessionFix

  before_action :configure_permitted_parameters, only: [:create, :update]
  respond_to :json

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

	def update
		Rails.logger.info "Params received: #{params.inspect}"
		# Rest of your update code
	end

  def register_success
    render json: {
      message: "Signed up successfully.",
      user: current_user
    }, status: :ok
  end

  def register_failed(message)
		Rails.logger.error "Update failed with errors: #{message}"
    render json: { message: "Signing up failed", errors: message }, status: :unprocessable_entity
  end

	def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :username, :first_name, :last_name])
		devise_parameter_sanitizer.permit(:account_update, keys: [:username, :first_name, :last_name, :email, :password, :password_confirmation, :current_password])
  end
end
