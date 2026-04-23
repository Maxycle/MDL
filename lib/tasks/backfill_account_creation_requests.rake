namespace :backfill do
  desc "Link AccountCreationRequests to Users by email"
  task link_users: :environment do
    AccountCreationRequest.where(user_id: nil).find_each do |request|
      user = User.find_by(email: request.email)
      if user
        request.update(user: user, status: 1)
        puts "Linked #{request.email} and status updated to 1"
      end
    end
    puts "Done!"
  end
end