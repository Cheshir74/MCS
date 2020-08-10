class AddHomePageToHomes < ActiveRecord::Migration[6.0]
  def change
    Home.create! do |h|
      h.title = 'Home page'
      h.body = 'This is body Home Page'
    end
  end
end
