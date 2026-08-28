require 'rails_helper'

RSpec.describe "Homes", type: :request do
  include Devise::Test::IntegrationHelpers

  describe "GET /" do
    it "returns http success with SEO metadata" do
      get home_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('name="description"')
      expect(response.body).to include('rel="canonical"')
    end
  end
end
