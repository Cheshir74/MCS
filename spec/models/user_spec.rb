require 'rails_helper'

RSpec.describe User, type: :model do
  it "normalizes email values" do
    expect(described_class.normalize_email(" USER@Example.COM ")).to eq("user@example.com")
  end

  it "keeps at least one superadmin" do
    user = create(:user, superadmin_role: true, supervisor_role: true, user_role: true)

    user.superadmin_role = false

    expect(user).not_to be_valid
    expect(user.errors[:superadmin_role]).to include("At least one superadmin must remain.")
  end
end
