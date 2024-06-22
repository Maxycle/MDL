class User < ApplicationRecord
	include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable,
	:registerable,
	:validatable,
	:jwt_authenticatable,
	jwt_revocation_strategy: self

	has_many :tracks, dependent: :destroy
	has_many :messages, dependent: :destroy
	
	validates :first_name, presence: true
  validates :last_name, presence: true
  validates :username, presence: true, uniqueness: true
	validates :password, presence: true, length: { minimum: 6 }
end
