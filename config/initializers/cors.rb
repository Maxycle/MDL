# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://libertarien.net', 'https://libertarien.net', 
         'http://www.libertarien.net', 'https://www.libertarien.net'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
			credentials: true,
      expose: ['access-token', 'expiry', 'token-type', 'Authorization']
  end
end