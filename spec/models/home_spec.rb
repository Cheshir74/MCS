require 'rails_helper'

RSpec.describe Home, type: :model do
  it "stores custom SEO metadata in editorial settings" do
    home = described_class.new(seo_title: "SEO title", seo_description: "SEO description")

    expect(home.seo_title).to eq("SEO title")
    expect(home.seo_description).to eq("SEO description")
    expect(home.editorial_settings).to include("seo_title" => "SEO title", "seo_description" => "SEO description")
  end
end
