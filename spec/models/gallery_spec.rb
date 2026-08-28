require 'rails_helper'

RSpec.describe Gallery, type: :model do
  it "stores custom SEO metadata in homepage settings" do
    gallery = described_class.new(seo_title: "SEO title", seo_description: "SEO description")

    expect(gallery.seo_title).to eq("SEO title")
    expect(gallery.seo_description).to eq("SEO description")
    expect(gallery.homepage_settings).to include("seo_title" => "SEO title", "seo_description" => "SEO description")
  end
end
