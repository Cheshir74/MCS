# frozen_string_literal: true

namespace :admin do
  desc "Create the first superadmin and print its generated credentials once"
  task ensure_superadmin: :environment do
    email = ENV.fetch("FIRST_ADMIN_EMAIL", "admin@example.com").strip.downcase

    abort "FIRST_ADMIN_EMAIL is required" if email.empty?

    existing_user = User.find_by(email: email)
    if existing_user
      existing_user.update!(
        confirmed_at: existing_user.confirmed_at || Time.current,
        superadmin_role: true,
        supervisor_role: true,
        user_role: true
      )

      puts "FIRST_ADMIN_STATUS=existing"
      puts "FIRST_ADMIN_EMAIL=#{existing_user.email}"
      exit
    end

    password = SecureRandom.urlsafe_base64(24)
    user = User.create!(
      email: email,
      password: password,
      password_confirmation: password,
      confirmed_at: Time.current,
      superadmin_role: true,
      supervisor_role: true,
      user_role: true
    )

    puts "FIRST_ADMIN_STATUS=created"
    puts "FIRST_ADMIN_EMAIL=#{user.email}"
    puts "FIRST_ADMIN_PASSWORD=#{password}"
  end
end
