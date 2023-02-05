class AddHomePageToHomes < ActiveRecord::Migration[6.1]
    def change
      Home.create! do |h|
        h.title = 'Home page'
        h.body = 'This is body Home Page'
        h.visible = 't'
      end
      User.create! do |u|
        u.email     = 'mail@test.ru'
        u.password    = 'testpass'
        u.confirmed_at = DateTime.now
        u.superadmin_role = 't'
        u.supervisor_role = 't'
      end
    end
  end
  
