class Score < ApplicationRecord
  belongs_to :user

  # Validations
  validates :domain, presence: true
  validates :level, presence: true
end
