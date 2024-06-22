class AddDomainAndLevelToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :domain, :text
    add_column :questions, :level, :text
  end
end
