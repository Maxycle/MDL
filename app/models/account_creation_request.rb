class AccountCreationRequest < ApplicationRecord
	validates :first_name, presence: true
  validates :last_name, presence: true
	validates :email, presence: true, uniqueness: true
	validates :motivations, presence: true

	# Scope to find requests not yet approved by a specific user
  scope :not_approved_by, ->(user_id) { where("NOT(? = ANY(approval_ids))", user_id) }
	scope :not_refused, -> { where(refused: false) }
end
