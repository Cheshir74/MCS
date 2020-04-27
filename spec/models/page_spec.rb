require 'rails_helper'

RSpec.describe Page, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:body) }

  end
  it 'validates presence of title' do
    expect(Page.new(body: '123')).to_not be_valid
  end
end
