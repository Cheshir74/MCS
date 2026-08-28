require "rails_helper"

RSpec.describe "WWW redirect", type: :request do
  around do |example|
    previous_canonical_host = ENV["CANONICAL_HOST"]
    previous_production_app_host = ENV["PRODUCTION_APP_HOST"]

    ENV["CANONICAL_HOST"] = "example.com"
    ENV.delete("PRODUCTION_APP_HOST")

    example.run
  ensure
    ENV["CANONICAL_HOST"] = previous_canonical_host
    ENV["PRODUCTION_APP_HOST"] = previous_production_app_host
  end

  it "redirects www host to the canonical host" do
    get "http://www.example.com/articles?foo=bar"

    expect(response).to have_http_status(:moved_permanently)
    expect(response.headers["Location"]).to eq("http://example.com/articles?foo=bar")
  end
end
