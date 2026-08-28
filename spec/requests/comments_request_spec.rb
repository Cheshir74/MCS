require 'rails_helper'

RSpec.describe "Comments", type: :request do
  describe "POST /articles/:article_id/comments" do
    it "requires authentication" do
      article = Article.create!(title: "Story title", body: "Story body")

      post article_comments_path(article), params: {
        comment: { username: "Reader", body: "Comment body" }
      }

      expect(response).to redirect_to(new_user_session_path)
      expect(article.comments.count).to eq(0)
    end
  end
end
