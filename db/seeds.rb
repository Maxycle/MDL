require 'faker'

# Generate fake questions
5.times do
  Question.create(
    content: Faker::Quote.famous_last_words,
    domain: "DN",
    level: "BA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.jack_handey,
    domain: "DN",
    level: "SA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.mitch_hedberg,
    domain: "EA",
    level: "BA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.matz,
    domain: "EA",
    level: "SA"
  )
end

# Generate fake answers for each question
values = [0, 25, 50, 75, 100]
Question.all.each do |question|
  values.each do |value|
    Answer.create(
      content: Faker::Lorem.sentence,
      question: question,
      value: value
    )
  end
end

# Create and attach only 3 answers for Question with id = 5
specific_values = [0, 50, 100]
question = Question.find(5)
specific_values.each do |value|
  Answer.create(
    content: Faker::Lorem.sentence,
    question: question,
    value: value
  )
end
