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
    
    mail(to: @account_creation_request.email, subject: 'Please Validate Your Email for MDL Account Request')
  end

	private
  
  def frontend_url
    Rails.env.production? ? ENV['FRONTEND_URL'] || "https://www.libertarien.net" : "http://localhost:5173"
  end
end