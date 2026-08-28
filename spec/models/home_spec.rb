require 'rails_helper'

RSpec.describe Home, type: :model do
  it "stores custom SEO metadata in editorial settings" do
    home = described_class.new(seo_title: "SEO title", seo_description: "SEO description")

    expect(home.seo_title).to eq("SEO title")
    expect(home.seo_description).to eq("SEO description")
    expect(home.editorial_settings).to include("seo_title" => "SEO title", "seo_description" => "SEO description")
  end

  it "defaults new records to the legacy design and known section order" do
    home = described_class.new

    expect(home.design_variant).to eq("legacy")
    expect(home.section_order_list).to eq(%w[gallery about contact])
  end

  it "normalizes section order and appends missing sections" do
    home = described_class.new(section_order: "contact,unknown,gallery")

    expect(home.section_order_list).to eq(%w[contact gallery about])
  end

  it "unpublishes other home records when one becomes visible" do
    first_home = described_class.create!(title: "First", visible: true)
    second_home = described_class.create!(title: "Second", visible: true)

    expect(first_home.reload.visible).to be(false)
    expect(second_home.reload.visible).to be(true)
  end
end
