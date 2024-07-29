Rails.application.routes.draw do
  get 'questionnaire_params/show'
  get 'questionnaire_params/update'
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

	get 'questions/export', to: 'csv_uploads#export'

  resources :questions do
		collection do
      delete 'destroy_all'
    end
    resources :answers, only: [:index, :create]
  end
  
  resources :answers, only: [:show, :update, :destroy]
	resources :scores
	resources :users, only: [:index]

	get "/questionnaire-params", to: 'questionnaire_params#index'
	get "/uzer-scores", to: 'scores#user_scores'
	get "/member-data", to: "members#show"
	put "/questionnaire-params", to: 'questionnaire_params#update'
	get "*path", to: "static#index", constraints: proc { |request| !request.xhr? && request.format.html? }
end
