class UserMailer < Devise::Mailer
  def confirmation_instructions(record, token, opts = {})
    @token = token
    host = ActionMailer::Base.default_url_options[:host]
    port = ActionMailer::Base.default_url_options[:port]
    @confirmation_link = "http://#{host}:#{port}/confirmation?confirmation_token=#{token}"
    
    opts[:template_path] = 'devise/mailer'
    super
  end
end
