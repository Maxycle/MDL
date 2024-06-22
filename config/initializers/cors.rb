# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*' # Update this to be more restrictive in production
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
			expose: ['access-token', 'expiry', 'token-type', 'Authorization']
  end
end
