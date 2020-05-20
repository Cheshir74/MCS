Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  devise_for :users, controllers: {
      sessions: 'users/sessions',
      passwords: 'users/passwords'
      #registrations: 'users/registrations',
     # confirmations: 'confirmations'
  }
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'articles#index', as: 'home'


  get 'about' => 'pages#about'
  resources :articles do
    resources :comments
  end

end
