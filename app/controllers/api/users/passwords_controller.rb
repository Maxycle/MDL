# app/controllers/users/passwords_controller.rb
module Api	
	module Users
		class PasswordsController < Devise::PasswordsController
			respond_to :json
			
			# Override to return JSON response instead of default Devise behavior
			def create
				self.resource = resource_class.send_reset_password_instructions(resource_params)
				yield resource if block_given?

				if successfully_sent?(resource)
					render json: { status: { code: 200, message: 'Reset password instructions sent' } }
				else
					render json: {
						status: { code: 422, message: 'Failed to send reset instructions' },
						errors: resource.errors.full_messages
					}, status: :unprocessable_entity
				end
			end

			# Override for password update
			def update
				self.resource = resource_class.reset_password_by_token(resource_params)
				yield resource if block_given?

				if resource.errors.empty?
					resource.unlock_access! if unlockable?(resource)
					render json: { status: { code: 200, message: 'Password updated successfully' } }
				else
					render json: {
						status: { code: 422, message: 'Failed to update password' },
						errors: resource.errors.full_messages
					}, status: :unprocessable_entity
				end
			end
		end
	end
end