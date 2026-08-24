require "rails_helper"

RSpec.describe "Admin users bulk actions", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { create(:user, email: "admin@example.com", superadmin_role: true, supervisor_role: false, user_role: false) }
  let!(:viewer) { create(:user, email: "viewer@example.com", superadmin_role: false, supervisor_role: false, user_role: true) }
  let!(:editor) { create(:user, email: "editor@example.com", superadmin_role: false, supervisor_role: true, user_role: false) }

  before do
    sign_in admin
  end

  describe "PATCH /admin/users/bulk_update" do
    it "applies a role preset to selected users" do
      patch bulk_update_admin_users_path, params: {
        user_ids: [viewer.id, editor.id],
        bulk_operation: "set_role",
        role_preset: "superadmin"
      }

      expect(response).to redirect_to(admin_users_path)
      expect(viewer.reload.superadmin_role).to be(true)
      expect(viewer.supervisor_role).to be(true)
      expect(viewer.user_role).to be(true)
      expect(editor.reload.superadmin_role).to be(true)
      expect(editor.supervisor_role).to be(true)
      expect(editor.user_role).to be(true)
    end

    it "deletes selected users and skips the current account" do
      patch bulk_update_admin_users_path, params: {
        user_ids: [viewer.id, admin.id],
        bulk_operation: "delete"
      }

      expect(response).to redirect_to(admin_users_path)
      expect(User.exists?(viewer.id)).to be(false)
      expect(User.exists?(admin.id)).to be(true)
    end
  end
end
