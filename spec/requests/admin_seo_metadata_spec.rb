require "rails_helper"

RSpec.describe "Admin SEO metadata", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { create(:user, superadmin_role: true, supervisor_role: true, user_role: true) }

  before do
    sign_in admin
  end

  describe "PATCH /admin/homes/:id" do
    it "updates homepage SEO metadata" do
      home = Home.create!(title: "Home", body: "Body")

      patch admin_home_path(home), params: {
        home: {
          title: home.title,
          body: home.body,
          seo_title: "Edited home SEO title",
          seo_description: "Edited home SEO description"
        }
      }

      expect(response).to redirect_to(edit_admin_home_path(home))
      expect(home.reload.seo_title).to eq("Edited home SEO title")
      expect(home.seo_description).to eq("Edited home SEO description")
    end
  end

  describe "PATCH /admin/galleries/:id" do
    it "updates gallery SEO metadata" do
      gallery = Gallery.create!(name: "Gallery", visible: true)

      patch admin_gallery_path(gallery), params: {
        gallery: {
          name: gallery.name,
          visible: gallery.visible,
          seo_title: "Edited gallery SEO title",
          seo_description: "Edited gallery SEO description"
        }
      }

      expect(response).to redirect_to(edit_admin_gallery_path(gallery))
      expect(gallery.reload.seo_title).to eq("Edited gallery SEO title")
      expect(gallery.seo_description).to eq("Edited gallery SEO description")
    end
  end
end
