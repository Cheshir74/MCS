require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the AdminHelper. For example:
#
# describe AdminHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe AdminHelper, type: :helper do
  describe "#admin_user_roles" do
    it "returns viewer for a viewer-only account" do
      user = build(:user, user_role: true, supervisor_role: false, superadmin_role: false)

      expect(helper.admin_user_roles(user)).to eq(["Viewer"])
    end

    it "hides the viewer badge when an elevated role exists" do
      user = build(:user, user_role: true, supervisor_role: true, superadmin_role: false)

      expect(helper.admin_user_roles(user)).to eq(["Editor"])
    end
  end
end
