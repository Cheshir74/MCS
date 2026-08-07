FactoryBot.define do
  sequence :user_email do |n|
    "user#{n}@example.com"
  end

  factory :user do
    email { generate(:user_email) }
    password { "Password123!" }
    password_confirmation { password }
    confirmed_at { Time.current }
    user_role { true }
    supervisor_role { false }
    superadmin_role { false }
  end
end
