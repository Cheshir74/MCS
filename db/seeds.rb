# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
admin = User.create!(
  email: 'test@example.com',
  password: 'password',
  password_confirmation: 'password',
  confirmed_at: Time.current, # Подтверждаем email сразу,
  superadmin_role: true,
  supervisor_role: true,
  user_role: true

)
puts "Created admin user: #{admin.email}"