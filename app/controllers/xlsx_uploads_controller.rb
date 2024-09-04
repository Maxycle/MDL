class XlsxUploadsController < ApplicationController
  require 'roo'
	require 'axlsx'

  def create
    file = params[:file]

    if file.content_type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      begin
        xlsx = Roo::Spreadsheet.open(file.path)
        sheet = xlsx.sheet(0) # Access the first sheet

        sheet.each_with_index(headers: true) do |row, index|
          next if index.zero? || row['status']&.strip != "inProdOn"# Skip header row if using headers

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

					if question_attributes[:content].present?
						ActiveRecord::Base.transaction do
							question = Question.create!(question_attributes)
							answer_attributes.each do |attrs|
								attrs[:question_id] = question.id
								if attrs[:content].present? && attrs[:value].present?
									Answer.create!(attrs)
								end
							end
						end
					end
        end
        render json: { message: 'XLSX file imported successfully' }, status: :ok
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Invalid file format' }, status: :unprocessable_entity
    end
  end

  def export_questions
    questions = Question.includes(:answers)
    xlsx = Axlsx::Package.new
    workbook = xlsx.workbook

    workbook.add_worksheet(name: "Questions") do |sheet|
      sheet.add_row ['question_content', 'question_level', 'question_domain', 'answer1_content', 'answer1_value', 'answer2_content', 'answer2_value', 'answer3_content', 'answer3_value', 'answer4_content', 'answer4_value', 'answer5_content', 'answer5_value']

      questions.each do |question|
        answer_data = question.answers.map { |a| [a.content, a.value] }.flatten
        sheet.add_row [
          question.content,
          question.level,
          question.domain,
          *answer_data
        ]
      end
    end

    send_data xlsx.to_stream.read, filename: "questionskrugh-#{Date.today}.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  end

	def export_users
		users = User.includes(:scores)
    xlsx = Axlsx::Package.new
    workbook = xlsx.workbook

    workbook.add_worksheet(name: "Users with Scores") do |sheet|
      # Add header row
      sheet.add_row ['User ID', 'First Name', 'Last Name', 'Email', 'Username', 'Scores']

      users.each do |user|
        # Join all the scores into a single string
				scores = user.scores.map { |score| "#{score.domain} (#{score.level}) - étape #{score.step} le #{score.try_date.strftime('%Y-%m-%d')}" }.join('; ')
        # Add a row for each user
        sheet.add_row [
          user.id,
          user.first_name,
          user.last_name,
          user.email,
          user.username,
          scores
        ]
      end
    end

    # Send the Excel file as a download
    send_data xlsx.to_stream.read, filename: "users-with-scores-#{Date.today}.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  end
end
