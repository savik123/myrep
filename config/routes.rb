Rails.application.routes.draw do
  resources :machines, only: [:index, :show]
  get "/warehouse/shelf", to: "warehouse_items#shelf"
  post "/warehouse_items/:id/take", to: "warehouse_items#take"
  post "/profile", to: "profiles#create"
  root "dashboard#index"
end