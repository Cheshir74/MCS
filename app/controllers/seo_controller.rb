class SeoController < ActionController::Base
  def robots
    render plain: [
      "User-agent: *",
      "Disallow: /admin",
      "Disallow: /users",
      "Disallow: /rails/active_storage",
      "Sitemap: #{canonical_url('/sitemap.xml')}"
    ].join("\n")
  end

  def sitemap
    render xml: sitemap_xml
  end

  private

  def sitemap_xml
    urls = sitemap_urls

    <<~XML
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      #{urls.map { |url| sitemap_url_node(url) }.join}
      </urlset>
    XML
  end

  def sitemap_urls
    urls = [
      { loc: canonical_url(home_path), lastmod: Home.maximum(:updated_at), changefreq: "weekly", priority: "1.0" },
      { loc: canonical_url(about_path), lastmod: SiteSetting.maximum(:updated_at), changefreq: "monthly", priority: "0.7" }
    ]

    Gallery.where(visible: true).find_each do |gallery|
      urls << {
        loc: canonical_url(gallery_path(gallery)),
        lastmod: gallery.updated_at,
        changefreq: "monthly",
        priority: "0.8"
      }
    end

    urls
  end

  def sitemap_url_node(url)
    <<~XML
        <url>
          <loc>#{ERB::Util.html_escape(url[:loc])}</loc>
          <lastmod>#{url[:lastmod]&.to_date&.iso8601 || Date.current.iso8601}</lastmod>
          <changefreq>#{url[:changefreq]}</changefreq>
          <priority>#{url[:priority]}</priority>
        </url>
    XML
  end

  def canonical_url(path)
    normalized_path = path.to_s.presence || "/"
    normalized_path = "/#{normalized_path}" unless normalized_path.start_with?("/")
    "#{canonical_base_url}#{normalized_path}"
  end

  def canonical_base_url
    host = ENV["CANONICAL_HOST"].presence || ENV["PRODUCTION_APP_HOST"].presence || request.host
    host = host.to_s.sub(%r{\Ahttps?://}i, "").split("/").first
    host = host.sub(/\Awww\./i, "")
    scheme = Rails.env.production? || Rails.application.config.force_ssl ? "https" : request.protocol.delete_suffix("://")

    "#{scheme}://#{host}"
  end
end
