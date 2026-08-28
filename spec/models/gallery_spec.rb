require 'rails_helper'

RSpec.describe Gallery, type: :model do
  it "stores custom SEO metadata in homepage settings" do
    gallery = described_class.new(seo_title: "SEO title", seo_description: "SEO description")

    expect(gallery.seo_title).to eq("SEO title")
    expect(gallery.seo_description).to eq("SEO description")
    expect(gallery.homepage_settings).to include("seo_title" => "SEO title", "seo_description" => "SEO description")
  end

  it "uses the name as a fallback homepage title" do
    gallery = described_class.new(name: "Opening night")

    expect(gallery.homepage_content(:homepage_title)).to eq("Opening night")
  end

  it "uses defaults for blank homepage metadata" do
    gallery = described_class.new

    expect(gallery.homepage_content(:homepage_description)).to eq("Серия для публикации и визуального архива события.")
    expect(gallery.homepage_tags_list).to eq(["backstage", "детали", "хроника"])
  end
end
