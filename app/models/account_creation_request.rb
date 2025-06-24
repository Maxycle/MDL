class AccountCreationRequest < ApplicationRecord
  before_create :generate_validation_token
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :motivations, presence: true
  
  # Scope to find requests not yet approved by a specific user
  scope :not_refused, -> { where(refused: false) }
  scope :active, -> { where(validated: true) }
  scope :inactive, -> { where(validated: false) }
	scope :email_not_sent, -> { where(email_sent: false) }
  scope :not_approved_by, ->(user_id) { where.not("? = ANY(approval_ids)", user_id) }
  scope :approved_by, ->(user_id) { where("? = ANY(approval_ids)", user_id) }

	# Set token expiration time (e.g., 24 hours)
  TOKEN_EXPIRATION = 24.hours
  
  # Check if token is expired
  def token_expired?
    token_created_at < Time.current - TOKEN_EXPIRATION
  end
  
  # Validate email with token - instance method
  def validate_with_token(token)
    return false unless validation_token == token
    return false if token_expired?
    update(validated: true)
    true
  end
  
  # Class method to find and validate with token
  def self.find_and_validate_with_token(token)
    request = find_by(validation_token: token)
    return nil unless request
    request.validate_with_token(token) ? request : nil
  end
  
  private
  
  def generate_validation_token
    self.validation_token = SecureRandom.urlsafe_base64(32)
    self.token_created_at = Time.current
  end
end