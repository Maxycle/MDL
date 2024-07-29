
require 'faker'

QuestionnaireParam.new().save

10.times do
	unique_username = nil
  while unique_username.nil? || User.exists?(username: unique_username)
    unique_username = Faker::Creature::Horse.breed
  end

	unique_email = nil
  while unique_email.nil? || User.exists?(email: unique_email)
    unique_email = Faker::Internet.email
  end

  User.create(
		first_name: Faker::Name.name,
		last_name: Faker::Name.last_name,
    username: unique_username,
    email: unique_email,
    password: 123456
  )
end