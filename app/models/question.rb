class Question < ApplicationRecord
  has_many :answers, dependent: :destroy

  validates :content, presence: true

	accepts_nested_attributes_for :answers, allow_destroy: true
end
