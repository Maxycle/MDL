class ChangeDefaultCertificationInUsers < ActiveRecord::Migration[7.0]  # Your Rails version may differ
	def up
		change_column_default :users, :certification, "SM"
		User.where(certification: "not certified").update_all(certification: "SM")
	end

	def down
		change_column_default :users, :certification, "not certified"
	end
end
