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
  get 'message' => 'messages#new'
  post 'message' => 'messages#create'
  namespace :admin do
    get '/' => 'admin#index'
    resources :users
    resources :galleries, except: [:show] do
      member do
        delete :delete_image_attachment
        delete :destroy_attach
        patch :sort
      end
    end

    resources :pages, except: [:show] 
    
    resources :homes, except: [:show] do
      member do
        delete :delete_image_attachment
        delete :destroy_attach
        patch :sort
      end
    end
  end
  resources :articles do
    resources :comments
  end
  get 'homes/show'
  resources :images, :galleries, only: [:show]
end
