Rails.application.routes.draw do
  namespace :api do
    resources :xlsx_uploads, only: [:create]

    devise_for :users, path: '', path_names: {
      sign_in: 'login',
      sign_out: 'logout',
      registration: 'signup'
    }, controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations'
    }

    devise_scope :user do
      get '/users/confirmation', to: 'users/registrations#confirm'
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

    resources :answers, only: [:show, :update, :destroy]
    resources :scores
    resources :users, only: [:index]

    get "/questionnaire-params", to: 'questionnaire_params#index'
    put "/questionnaire-params", to: 'questionnaire_params#update'
    get "/uzer-scores", to: 'scores#user_scores'
    get "/member-data", to: "members#show"
  end

  get "*path", to: "static#index", constraints: proc { |request| !request.xhr? && request.format.html? }
end
