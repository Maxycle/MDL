class ConfirmationsController < Devise::ConfirmationsController
	before_action :set_devise_mapping

	def confirm
		self.resource = resource_class.confirm_by_token(params[:confirmation_token])
	
		if resource.errors.empty?
			render json: { message: 'Your email has been confirmed successfully.' }, status: :ok
		else
			render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
		end
	end	

	private

  def set_devise_mapping
    request.env["devise.mapping"] = Devise.mappings[:user]
  end
end
