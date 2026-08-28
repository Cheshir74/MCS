require 'rails_helper'

RSpec.describe "Articles", type: :request do
  describe "GET /articles" do
    it "renders the public articles index" do
      Article.create!(title: "Public story", body: "Short public story body")

      get articles_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Все материалы")
      expect(response.body).to include("Public story")
    end
  end

  describe "GET /articles/:id" do
    it "requires authentication" do
      article = Article.create!(title: "Private story", body: "Private body")

      get article_path(article)

      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
