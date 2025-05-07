class AccountCreationRequestController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create, :validate_email]
  before_action :set_account_creation_request, only: [:accept_candidate, :refuse_candidate, :validate_email]

  def index
		@accountCreationRequests = AccountCreationRequest.all
		
		if params[:pending_approval]
			@accountCreationRequests = @accountCreationRequests.active.not_refused.not_approved_by(current_user.id)
		end
		
		render json: @accountCreationRequests.as_json
	end

  def create
    @accountCreationRequest = AccountCreationRequest.new(request_params)
    if @accountCreationRequest.save
			# Send validation email
      AccountCreationRequestMailer.email_validation(@accountCreationRequest).deliver_now
      render json: @accountCreationRequest, status: :created
    else
      render json: @accountCreationRequest.errors, status: :unprocessable_entity
    end
  end

  def validate_email
    if @accountCreationRequest && @accountCreationRequest.validate_with_token(params[:token])
      redirect_to "#{frontend_url}/confirmation?status=success&email=#{CGI.escape(@accountCreationRequest.email)}"
    else
      redirect_to "#{frontend_url}/confirmation?status=error&message=#{CGI.escape('Invalid or expired token')}"
    end
  end

  def accept_candidate
    # Check if current user's ID is already in the approval_ids array
    unless @accountCreationRequest.approval_ids.include?(current_user.id)
      # Add current user's ID to the approval_ids array
      @accountCreationRequest.approval_ids << current_user.id
      
      if @accountCreationRequest.save

				# Count PP users
				pp_users_count = User.pp_users.count

				# Check if all PP users have approved
				if @accountCreationRequest.approval_ids.length >= pp_users_count && !@accountCreationRequest.email_sent

					# Send welcome email
					AccountCreationRequestMailer.welcome_email(@accountCreationRequest).deliver_now

					# Mark email as sent and record the timestamp
					@accountCreationRequest.update(email_sent: true, email_sent_at: Time.current)
				end

        render json: @accountCreationRequest, status: :ok
      else
        render json: @accountCreationRequest.errors, status: :unprocessable_entity
      end
    else
      render json: { message: "You have already approved this candidate" }, status: :unprocessable_entity
    end
  end

	def refuse_candidate
		if @accountCreationRequest.refused
			render json: { message: "This candidate has already been refused" }, status: :unprocessable_entity
			return
		end
		
		if @accountCreationRequest.approval_ids.include?(current_user.id)
			render json: { message: "You have already approved this candidate" }, status: :unprocessable_entity
			return
		end
		
		# Use update for the first change
		if @accountCreationRequest.update(refused: true)
			# Send email
			AccountCreationRequestMailer.refuse_request_email(@accountCreationRequest).deliver_now
			
			# Use update again for the tracking fields
			@accountCreationRequest.update(email_sent: true, email_sent_at: Time.current)
			
			render json: @accountCreationRequest, status: :ok
		else
			render json: @accountCreationRequest.errors, status: :unprocessable_entity
		end
	end

  private
  
  # Set account creation request for specific actions
  def set_account_creation_request
    @accountCreationRequest = AccountCreationRequest.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Account creation request not found" }, status: :not_found
  end

  # Only allow a list of trusted parameters through.
  def request_params
    params.require(:account_creation_request).permit(:email, :first_name, :last_name, :motivations, :referencer, :validated)
  end

	def frontend_url
		Rails.env.production? ? ENV['FRONTEND_URL'] || "https://www.libertarien.net/" : "http://localhost:5173"
	end
end