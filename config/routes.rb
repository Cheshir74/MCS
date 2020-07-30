Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/dashboard', as: 'rails_admin'
  devise_for :users, controllers: {
      sessions: 'users/sessions',
      passwords: 'users/passwords'
      #registrations: 'users/registrations',
     # confirmations: 'confirmations'
  }

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  #root 'articles#index', as: 'home'
  root 'homes#index', as: 'home'
  get "upload" => "images#new", :as => "upload"
  get 'about' => 'pages#about'
  namespace :admin do
    get '/' => 'admin#index'
    resources :users
    resources :galleries, except: [:show]
  end
  resources :articles do
    resources :comments
  end
  get 'homes/index'
  get 'homes/show'
  resources :images, :galleries, only: [:show]
  resources :pages, only: [:show]
end
