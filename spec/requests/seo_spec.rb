require "rails_helper"

RSpec.describe "SEO", type: :request do
  around do |example|
    previous_host = ENV["CANONICAL_HOST"]
    ENV["CANONICAL_HOST"] = "example.com"
    host! "example.com"
    example.run
  ensure
    ENV["CANONICAL_HOST"] = previous_host
  end

  describe "GET /robots.txt" do
    it "allows crawling public pages and points to sitemap" do
      get "/robots.txt"

      expect(response).to have_http_status(:success)
      expect(response.media_type).to eq("text/plain")
      expect(response.body).to include("User-agent: *")
      expect(response.body).to include("Disallow: /admin")
      expect(response.body).to include("Sitemap: http://example.com/sitemap.xml")
    end
  end

  describe "GET /sitemap.xml" do
    it "lists public canonical urls" do
      Gallery.create!(name: "Reportage", visible: true)
      Gallery.create!(name: "Hidden", visible: false)

      get "/sitemap.xml"

      expect(response).to have_http_status(:success)
      expect(response.media_type).to eq("application/xml")
      expect(response.body).to include("<loc>http://example.com/</loc>")
      expect(response.body).to include("<loc>http://example.com/about</loc>")
      expect(response.body).to include("http://example.com/galleries/#{Gallery.find_by(name: 'Reportage').id}")
      expect(response.body).not_to include("Hidden")
    end
  end

  describe "public layout metadata" do
    it "renders canonical and social metadata" do
      get home_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('name="description"')
      expect(response.body).to include('rel="canonical" href="http://example.com/"')
      expect(response.body).to include('property="og:title"')
      expect(response.body).to include('name="twitter:card"')
    end

    it "uses custom homepage SEO fields when present" do
      Home.create!(
        title: "Fallback home",
        body: "Fallback description",
        visible: true,
        seo_title: "Custom homepage SEO title",
        seo_description: "Custom homepage SEO description for search engines"
      )

      get home_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Custom homepage SEO title")
      expect(response.body).to include("Custom homepage SEO description for search engines")
    end

    it "uses custom gallery SEO fields when present" do
      gallery = Gallery.create!(
        name: "Fallback gallery",
        visible: true,
        seo_title: "Custom gallery SEO title",
        seo_description: "Custom gallery SEO description for search engines"
      )

      get gallery_path(gallery)

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Custom gallery SEO title")
      expect(response.body).to include("Custom gallery SEO description for search engines")
    end
  end
end
