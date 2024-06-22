require 'faker'

# Generate fake questions
5.times do
  Question.create(
    content: Faker::Quote.famous_last_words,
    domain: "droit naturel",
    level: "BA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.jack_handey,
    domain: "droit naturel",
    level: "SA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.mitch_hedberg,
    domain: "école autrichienne",
    level: "BA"
  )
end

5.times do
  Question.create(
    content: Faker::Quote.matz,
    domain: "école autrichienne",
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
