require 'rails_helper'

RSpec.describe Image, type: :model do
  it { should validate_presence_of(:gallery_id) }

  it "has one attached image" do
    expect(described_class.reflect_on_attachment(:image).macro).to eq(:has_one_attached)
  end
end
