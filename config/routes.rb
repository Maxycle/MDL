Rails.application.routes.draw do
  # get 'csv_uploads/create'
	resources :csv_uploads, only: [:create]

	devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  resources :questions do
		collection do
      delete 'destroy_all'
    end
    resources :answers, only: [:index, :create]
  end
  
  resources :answers, only: [:show, :update, :destroy]

	get "/member-data", to: "members#show"
	get "*path", to: "static#index", constraints: proc { |request| !request.xhr? && request.format.html? }
end
