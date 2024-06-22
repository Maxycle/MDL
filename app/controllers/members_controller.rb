class MembersController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[show]

  def show
    begin
      user = set_user_from_token

      if user
        render json: {
          message: "If you see this you're logged in",
          user: user
        }, status: :ok
      else
        jwt_payload = set_jwt_payload
        jti = jwt_payload["jti"]
        exp = Time.zone.at(jwt_payload["exp"]).to_datetime

        JwtDenylist.create(jti: jti, exp: exp)

        render json: {
          message: "Your JWT token was linked to a deleted user account"
        }, status: :unprocessable_entity
      end
    rescue JWT::DecodeError => e
      render json: {
        error: "Invalid or missing JWT token"
      }, status: :unprocessable_entity
    end
  end

  private

  def set_user_from_token
    jwt_payload = set_jwt_payload

    user_id = jwt_payload["sub"]

    User.find_by(id: user_id)
  end

  def set_jwt_payload
    token = request.headers["Authorization"].split[1]
    JWT.decode(token, Rails.application.credentials.devise[:jwt_secret_key]).first
  end
end
