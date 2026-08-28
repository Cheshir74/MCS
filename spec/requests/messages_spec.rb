require 'rails_helper'

RSpec.describe "Messages", type: :request do
  describe "GET /message" do
    it "renders the public contact form" do
      get message_path

      expect(response).to have_http_status(:success)
    end
  end
end
