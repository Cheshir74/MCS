require 'rails_helper'

RSpec.describe "Admins", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { create(:user, superadmin_role: true, supervisor_role: true, user_role: true) }

  before do
    sign_in admin
  end

  describe "GET /admin" do
    it "returns http success" do
      get admin_dashboard_path
      expect(response).to have_http_status(:success)
    end
  end

end
