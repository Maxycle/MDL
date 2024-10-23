class UserMailer < Devise::Mailer
  def confirmation_instructions(record, token, opts = {})
    @token = token
    @confirmation_link = "http://localhost:5173/confirmation?confirmation_token=#{token}"
    opts[:template_path] = 'devise/mailer' # Specify where to find the template
    super
  end
end
