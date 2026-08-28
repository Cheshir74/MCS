module ApplicationHelper
  def render_modal(title: "", body: "", footer: "")
    render(partial: '/partials/modal', locals: { title: title, body: body, footer: footer })
  end

  def site_favicon_tag
    if defined?(@site_setting) && @site_setting&.favicon&.attached?
      favicon = @site_setting.favicon
      favicon_link_tag url_for(favicon), rel: "icon", type: favicon.content_type, sizes: "any"
    else
      favicon_link_tag asset_path("favicon.png"), rel: "icon", type: "image/png"
    end
  end

  def seo_title
    title = content_for?(:title) ? content_for(:title) : seo_resource_title
    site_name = seo_site_name

    return site_name if title.blank? || title == site_name

    "#{title} | #{site_name}"
  end

  def seo_description
    raw_description =
      if content_for?(:description)
        content_for(:description)
      else
        seo_resource_description
      end

    clean = strip_tags(raw_description.to_s).squish
    clean = "#{seo_site_name}. Фотографии, репортажи и визуальные истории." if clean.blank?
    truncate(clean, length: 155, separator: " ", omission: "")
  end

  def canonical_url(path = request.path)
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

  def seo_meta_tags
    tags = [
      tag.meta(name: "description", content: seo_description),
      tag.link(rel: "canonical", href: canonical_url),
      tag.meta(property: "og:title", content: seo_title),
      tag.meta(property: "og:description", content: seo_description),
      tag.meta(property: "og:type", content: current_page?(home_path) ? "website" : "article"),
      tag.meta(property: "og:url", content: canonical_url),
      tag.meta(property: "og:site_name", content: seo_site_name),
      tag.meta(name: "twitter:card", content: seo_image_url.present? ? "summary_large_image" : "summary"),
      tag.meta(name: "twitter:title", content: seo_title),
      tag.meta(name: "twitter:description", content: seo_description)
    ]

    if seo_image_url.present?
      tags << tag.meta(property: "og:image", content: seo_image_url)
      tags << tag.meta(name: "twitter:image", content: seo_image_url)
    end

    safe_join(tags, "\n")
  end

  private

  def seo_site_name
    @site_setting&.name_site.presence || "Дмитрий Толстошеев"
  end

  def seo_resource_title
    return @gallery.homepage_content(:homepage_title) if defined?(@gallery) && @gallery.present?
    return @article.title if defined?(@article) && @article.present?
    return "О фотографе" if controller_name == "pages" && action_name == "about"

    if defined?(@home) && @home.present?
      return @home.editorial_content(:hero_title) if @home.editorial?

      return @home.title.presence
    end

    nil
  end

  def seo_resource_description
    return @gallery.homepage_content(:homepage_description) if defined?(@gallery) && @gallery.present?
    return @article.body if defined?(@article) && @article.present?

    if controller_name == "pages" && action_name == "about"
      return "О фотографе Дмитрии Толстошееве: репортажная съемка культурных событий, выставок, премьер и редакционных проектов."
    end

    if defined?(@home) && @home.present?
      return @home.editorial_content(:hero_body) if @home.editorial?

      return @home.body.presence || @home.body_block1.presence
    end

    nil
  end

  def seo_image_url
    image =
      if defined?(@gallery) && @gallery&.primary_image.present?
        @gallery.primary_image
      elsif defined?(@home) && @home&.image&.attached?
        @home.image
      end

    return if image.blank?

    canonical_url(url_for(image))
  rescue StandardError => e
    Rails.logger.debug("[SEO] image skipped: #{e.class}: #{e.message}")
    nil
  end
end
