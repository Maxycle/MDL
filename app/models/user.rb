class User < ApplicationRecord
	include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable,
	:registerable,
	:validatable,
	:jwt_authenticatable,
	jwt_revocation_strategy: self
	
	belongs_to :confirmed_by_admin, class_name: "User", foreign_key: "confirmed_by_admin_id", optional: true

	has_many :scores, dependent: :destroy
  has_many :posts, dependent: :destroy
	
	validates :first_name, presence: true
  validates :last_name, presence: true
	validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true

	def confirm_by_admin!(admin)
    update(confirmed_by_admin_id: admin.id, certification: 'SM')
  end
end
