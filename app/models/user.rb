class User < ApplicationRecord
	attr_accessor :login

	include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable,
	:registerable,
	:validatable,
	:recoverable,
	:jwt_authenticatable,
	jwt_revocation_strategy: self
	
	has_many :scores, dependent: :destroy
  has_many :posts, dependent: :destroy

	# Validations given as a PP user

	scope :pp_users, -> { where(certification: 'PP') }

	validates :first_name, presence: true
  validates :last_name, presence: true
	validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true

	def pp?
    certification == 'PP'
  end

	def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if (login = conditions.delete(:login))
      where(conditions.to_h).where(["lower(username) = :value OR lower(email) = :value", { value: login.downcase }]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      where(conditions.to_h).first
    end
  end
end
