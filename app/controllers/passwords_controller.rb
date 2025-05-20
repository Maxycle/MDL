class PasswordsController < ApplicationController
	skip_before_action :authenticate_user!, only: [:forgot, :reset]
	
	# Request password reset
	def forgot
		if params[:email].blank?
			return render json: { error: 'Email not present' }, status: :unprocessable_entity
		end
		
		user = User.find_by(email: params[:email])
		
		if user.present?
			# Generate the raw token before sending instructions
			raw_token, encrypted_token = Devise.token_generator.generate(User, :reset_password_token)

				# Store the encrypted token
				user.reset_password_token = encrypted_token
				user.reset_password_sent_at = Time.now.utc
				user.save(validate: false)

				# Send email with the raw token
				mail = DeviseMailer.reset_password_instructions(user, raw_token)
				mail.deliver_now

			render json: { status: 'ok', message: 'Reset password instructions sent to your email' }, status: :ok
		else
			render json: { error: 'Email address not found. Please check and try again.' }, status: :not_found
		end
	end
	
	# Reset password with token
	def reset
		if params[:not_forgotten] == true
			if params[:password].blank? || params[:password_confirmation].blank?
				return render json: { error: 'Missing required parameters' }, status: :unprocessable_entity
			end

			logged_in_User = User.find_by(email: params[:email])

			if params[:password] == params[:password_confirmation]
				logged_in_User.reset_password(params[:password], params[:password_confirmation])
				render json: { status: 'ok', message: 'Password has been reset successfully' }, status: :ok
			else
				render json: { error: 'Password and confirmation do not match' }, status: :unprocessable_entity
			end
		else
			if params[:token].blank? || params[:password].blank? || params[:password_confirmation].blank?
				return render json: { error: 'Missing required parameters' }, status: :unprocessable_entity
			end
			
			# Find user by raw token - raw tokens are used in URLs
			reset_password_token = Devise.token_generator.digest(User, :reset_password_token, params[:token])
			user = User.find_by(reset_password_token: reset_password_token)
			
			if user.present? && user.reset_password_period_valid?
				if params[:password] == params[:password_confirmation]
					user.reset_password(params[:password], params[:password_confirmation])
					render json: { status: 'ok', message: 'Password has been reset successfully' }, status: :ok
				else
					render json: { error: 'Password and confirmation do not match' }, status: :unprocessable_entity
				end
			else
				render json: { error: 'Invalid or expired reset token' }, status: :not_found
			end
		end
	end
end