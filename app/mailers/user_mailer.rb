class UserMailer < Devise::Mailer
  def confirmation_instructions(record, token, opts = {})
    @token = token
    host = ActionMailer::Base.default_url_options[:host]
    port = ActionMailer::Base.default_url_options[:port]
    
    # Construct the confirmation link without including the port if it's the default (80 for http or 443 for https)
    if port.present? && ((port != 80 && port != 443) || host == 'localhost')
      @confirmation_link = "http://#{host}:#{port}/confirmation?confirmation_token=#{token}"
    else
      @confirmation_link = "http://#{host}/confirmation?confirmation_token=#{token}"
    end

    opts[:template_path] = 'devise/mailer'
    super
  end
end
