class Question < ApplicationRecord
  has_many :answers, dependent: :destroy

  validates :content, presence: true
end
