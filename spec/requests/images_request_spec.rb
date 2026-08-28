require 'rails_helper'

RSpec.describe "Images", type: :request do
  describe "GET /upload" do
    it "requires authentication" do
      get upload_path

      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
