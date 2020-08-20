Rails.application.routes.draw do
  devise_for :users, controllers: {
      sessions: 'users/sessions',
      passwords: 'users/passwords',
      registrations: 'users/registrations'
     # confirmations: 'confirmations'
  }

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  #root 'articles#index', as: 'homes'
  root 'homes#index', as: 'home'
  get "upload" => "images#new", :as => "upload"
  get 'about' => 'pages#about'
  namespace :admin do
    get '/' => 'admin#index'
    resources :users
    resources :galleries, except: [:show]
    resources :homes, except: [:show]
  end
  resources :articles do
    resources :comments
  end
  get 'homes/show'
  resources :images, :galleries, only: [:show]
  resources :pages, only: [:show]
end
