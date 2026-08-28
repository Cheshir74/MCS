require "rails_helper"

RSpec.describe "Static error pages" do
  {
    "404" => "Страница не найдена",
    "422" => "Запрос отклонен",
    "500" => "Что-то пошло не так"
  }.each do |code, title|
    it "renders a branded #{code} page" do
      page = Rails.root.join("public/#{code}.html").read

      expect(page).to include("<html lang=\"ru\">")
      expect(page).to include("<strong>#{code}</strong>")
      expect(page).to include(title)
      expect(page).to include('href="/"')
      expect(page).to include("Вернуться на главную")
      expect(page).to include('name="robots"')
      expect(page).not_to include("rails-default-error-page")
      expect(page).not_to include("If you are the application owner")
    end
  end
end
