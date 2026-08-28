require "rails_helper"

RSpec.describe "Static 404 page" do
  it "has a link to the home page" do
    page = Rails.root.join("public/404.html").read

    expect(page).to include('href="/"')
    expect(page).to include("Вернуться на главную")
  end
end
