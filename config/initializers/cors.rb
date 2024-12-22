# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://libertarien.net', 'https://libertarien.net'
		# origins '*'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      # credentials: false,
			credentials: true,
      expose: ['access-token', 'expiry', 'token-type', 'Authorization']
  end
end