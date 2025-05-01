class AccountCreationRequestMailer < ApplicationMailer
  def welcome_email(account_creation_request)
    @account_creation_request = account_creation_request
    @url = "http://localhost:5173/signup"
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
end