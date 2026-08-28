require 'rails_helper'

RSpec.describe Article, type: :model do
  it { should validate_presence_of(:title) }
  it { should validate_length_of(:title).is_at_least(5) }

  it "can have comments" do
    article = described_class.create!(title: "Story title", body: "Story body")
    comment = article.comments.create!(username: "Reader", body: "Comment body")

    expect(article.comments).to include(comment)
  end
end
