Rails.application.routes.draw do
	scope '/api' do
    resources :xlsx_uploads, only: [:create]

    devise_for :users, path: '', path_names: {
      sign_in: 'login',
      sign_out: 'logout',
      registration: 'signup'
    }, controllers: {
      sessions: 'api/users/sessions',
      registrations: 'api/users/registrations',
    	passwords: 'api/users/passwords'
    }, skip: [:confirmations]

		namespace :admin do
      resources :users, only: [:destroy] do
				patch 'update_certification', on: :member
				patch 'give_admin_status', on: :member
				patch 'remove_admin_status', on: :member
      end
    end

		devise_scope :user do
			get '/validate_signup_token/:token', to: 'api/users/registrations#validate_signup_token'
		end

		resources :account_creation_request, only: [:index, :create] do
		member do
			post 'accept_candidate'
			post 'refuse_candidate'
			get '/validate_email/:token', to: 'account_creation_request#validate_email'
		end
	end

    get 'questions/export', to: 'xlsx_uploads#export_questions'
    get 'users/export', to: 'xlsx_uploads#export_users'

    resources :questions do
      collection do
        delete 'destroy_all'
        get 'index_admin', to: 'questions#index_admin'
      end
      resources :answers, only: [:index, :create]
    end

		resources :posts do
			post 'upload_image', on: :collection
		end
		
    resources :answers, only: [:show, :update, :destroy]
    resources :scores
    resources :users, only: [:index, :show] do
			collection do
				get 'unconfirmed', to: 'users#index_unconfirmed'
				get 'index_admin', to: 'users#index_admin'
			end
		end

		post 'passwords/forgot', to: 'passwords#forgot'
    post 'passwords/reset', to: 'passwords#reset'
    get "/questionnaire-params", to: 'questionnaire_params#index'
    put "/questionnaire-params", to: 'questionnaire_params#update'
    get "/uzer-scores", to: 'scores#user_scores'
    get "/member-data", to: "members#show"
  	get "*path", to: "static#index", constraints: proc { |request| !request.xhr? && request.format.html? }
  end
end

