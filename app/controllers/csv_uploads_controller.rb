class CsvUploadsController < ApplicationController
  require 'csv'

  def create
    file = params[:file]
    if file.content_type == 'text/csv'
      CSV.foreach(file.path, headers: true) do |row|
        question_attributes = {
          content: row['question_content'],
          level: row['question_level'],
          domain: row['question_domain'],
					difficulty: row['question_difficulty']
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
end
