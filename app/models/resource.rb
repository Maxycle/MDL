class Resource < ApplicationRecord
	belongs_to :user

  validates :url, presence: true
  validates :content, presence: true

	# Ensure only admin users can create posts
	validate :user_must_be_admin

  private

  def user_must_be_admin
    unless user&.admin?
      errors.add(:user, "must be an admin to create a resource")
    end
  end
end
