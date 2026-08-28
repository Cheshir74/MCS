require 'rails_helper'

RSpec.describe "Pages", type: :request do
  describe "GET /about" do
    it "renders the public about page with useful content" do
      get about_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include("О фотографе")
      expect(response.body).to include('name="description"')
      expect(response.body).not_to include("Slim Examples")
    end
  end
end
