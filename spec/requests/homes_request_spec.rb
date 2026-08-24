require 'rails_helper'

RSpec.describe "Homes", type: :request do
  include Devise::Test::IntegrationHelpers

  describe "GET /" do
    it "returns http success" do
      get home_path
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      sign_in create(:user)

      get "/homes/show"
      expect(response).to have_http_status(:success)
    end
  end

end
