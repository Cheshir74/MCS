FactoryBot.define do
  sequence :title do |n|
    "Article##{n}"
  end

  factory :article do
    title
    body { "MyText" }
  end

  factory :invalid_article, class: "Article" do
    title { nil }
    body { nil }
  end
end
