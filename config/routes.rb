Rails.application.routes.draw do
  namespace :admin do
    resources :users
    resources :galleries, except: [:show]
  end


  get 'homes/index'
  get 'homes/show'
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

  resources :articles do
    resources :comments
  end

  resources :images, :galleries, only: [:show]
  resources :pages, only: [:show]
end
