require 'rails_helper'

RSpec.describe "Galleries", type: :request do
  describe "GET /galleries/:id" do
    it "renders a public gallery page with gallery SEO metadata" do
      gallery = Gallery.create!(
        name: "Cultural opening",
        visible: true,
        seo_title: "Gallery SEO title",
        seo_description: "Gallery SEO description"
      )

      get gallery_path(gallery)

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Gallery SEO title")
      expect(response.body).to include("Gallery SEO description")
      expect(response.body).to include(%(rel="canonical" href="http://example.com/galleries/#{gallery.id}"))
    end
  end
end
