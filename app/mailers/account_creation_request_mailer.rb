class AccountCreationRequestMailer < ApplicationMailer
	include Rails.application.routes.url_helpers

  def welcome_email(account_creation_request)
    @account_creation_request = account_creation_request

		@url = "#{frontend_url}/signup/#{@account_creation_request.validation_token}"
    mail(
      to: @account_creation_request.email,
      subject: "Welcome! Your account request for MDL has been approved"
    )
  end

	def refuse_request_email(account_creation_request)
		@account_creation_request = account_creation_request
		mail(
      to: @account_creation_request.email,
      subject: "Your account request for MDL has not been approved"
    )
	end

	def email_validation(account_creation_request)
    @account_creation_request = account_creation_request

    @validation_url = "#{frontend_url}/api/account_creation_request/#{@account_creation_request.id}/validate_email/#{@account_creation_request.validation_token}"
    
    	mail(
			to: @account_creation_request.email, 
			subject: 'Please Validate Your Email for MDL Account Request'
		)
  end

	def pp_email_notification(account_creation_request, pp_user)
		@account_creation_request = account_creation_request
		@account_creation_requests_url = "#{frontend_url}/utilisateurs-non-confirmes"

		mail(
      to: pp_user.email,
      subject: 'Nouvelle demande d\'ouverture de compte dans libertarien.net'
    )
	end

	def self.send_pp_notifications(account_creation_request)
    User.pp_users.find_each do |pp_user|
      pp_email_notification(account_creation_request, pp_user).deliver_now
    end
  end

	private
  
  def frontend_url
    Rails.env.production? ? ENV['FRONTEND_URL'] || "https://www.libertarien.net" : "http://localhost:5173"
  end
end