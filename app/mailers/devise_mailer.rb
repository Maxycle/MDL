class DeviseMailer < Devise::Mailer
  default from: 'noreply@mouvement-libertariens.org'
  layout 'mailer'
  
  def reset_password_instructions(record, token, opts={})
    @token = token
		@resource = record
    # Create a custom frontend URL
    # You need to configure your frontend URL in config/application.rb or environment-specific config files
    # For example: config.action_mailer.default_url_options = { host: 'yourdomain.com' }
    edit_password_url = "#{Rails.application.config.frontend_url}/reset-password?token=#{token}&email=#{record.email}"
    
    # Send the actual email
    mail(to: record.email, subject: 'Instructions de réinitialisation de mot de passe') do |format|
      format.html { render "devise/mailer/reset_password_instructions" }
      format.text { render plain: "Réinitialisez votre mot de passe en suivant ce lien: #{edit_password_url}" }
    end
  end
end