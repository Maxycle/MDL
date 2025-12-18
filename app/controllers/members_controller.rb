class MembersController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: {
      message: "If you see this you're logged in",
      user: current_user
    }, status: :ok
  end
end
