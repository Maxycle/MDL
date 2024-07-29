class CsvUploadsController < ApplicationController
  require 'csv'

  def create
    file = params[:file]
    if file.content_type == 'text/csv'
      CSV.foreach(file.path, headers: true) do |row|
        question_attributes = {
          content: row['question_content'],
          level: row['question_level'],
          domain: row['question_domain']
        }

        answer_attributes = []
        (1..5).each do |i|
          answer_attributes << {
            content: row["answer#{i}_content"],
            value: row["answer#{i}_value"],
            question_id: nil # This will be set after the question is created
          }
        end

        ActiveRecord::Base.transaction do
          question = Question.create!(question_attributes)
          answer_attributes.each do |attrs|
            attrs[:question_id] = question.id
            Answer.create!(attrs)
          end
        end
      end
      render json: { message: 'CSV file imported successfully' }, status: :ok
    else
      render json: { error: 'Invalid file format' }, status: :unprocessable_entity
    end
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

	def export
    questions = Question.includes(:answers)
    csv_string = CSV.generate(headers: true) do |csv|
      csv << ['question_content', 'question_level', 'question_domain', 'answer1_content', 'answer1_value', 'answer2_content', 'answer2_value', 'answer3_content', 'answer3_value', 'answer4_content', 'answer4_value', 'answer5_content', 'answer5_value']

      questions.each do |question|
        answer_data = question.answers.map { |a| [a.content, a.value] }.flatten
        csv << [
          question.content,
          question.level,
          question.domain,
          *answer_data
        ]
      end
    end

    send_data csv_string, filename: "questions-#{Date.today}.csv"
  end
end
