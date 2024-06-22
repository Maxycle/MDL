# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
	include RackSessionFix

  before_action :configure_sign_up_params, only: [:create]
  respond_to :json

  private

  def set_flash_message(_key, _kind, _options); end

  def respond_with(resource, _opts = {})
    return register_success if resource.persisted?

    if resource.errors.any?
      message = resource.errors.full_messages
    else
      message = "Something went wrong."
    end

    register_failed(message)
  end

  def register_success
    render json: {
      message: "Signed up successfully.",
      user: current_user
    }, status: :ok
  end

  def register_failed(message)
    render json: { message: "Signing up failed"}, status: :unprocessable_entity
  end

	def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :username, :first_name, :last_name])
  end
end
