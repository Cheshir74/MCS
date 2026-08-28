module HomesHelper
  RICH_TEXT_ALLOWED_TAGS = %w[a b blockquote br code em h3 h4 i li ol p pre s strike strong u ul].freeze
  RICH_TEXT_ALLOWED_ATTRIBUTES = %w[href target rel].freeze
  SOCIAL_ICON_CLASSES = {
    telegram: "fa-brands fa-telegram",
    vk: "fa-brands fa-vk",
    instagram: "fa-brands fa-instagram",
    facebook: "fa-brands fa-facebook-f"
  }.freeze

  def editorial_home_page?
    current_page?(home_path) && defined?(@home) && @home&.editorial?
  end

  def editorial_brand_title(home)
    home.editorial_content(:hero_title).to_s.delete_suffix(".").presence
  end

  def editorial_brand_subtitle(home)
    location = home.editorial_content(:contacts_location_value).to_s.split(",").first
    ["Репортажный фотограф", location.presence].compact.join(" / ").presence
  end

  def optimized_variant_url(image, resize_to_limit:, format: :webp, quality: 78)
    return if image.blank?
    return if image.respond_to?(:attached?) && !image.attached?

    variant_options = { resize_to_limit: resize_to_limit }
    variant_options[:format] = format if format
    variant_options[:saver] = { quality: quality } if quality

    url_for(image.variant(variant_options))
  rescue StandardError => e
    Rails.logger&.warn("[ImageVariant] Variant URL failed for #{image.try(:filename)}: #{e.class} #{e.message}")
    url_for(image)
  end

  def editorial_media_style(image, resize_to_limit: [1600, 1000], position: "center center")
    image_url = optimized_variant_url(image, resize_to_limit: resize_to_limit)
    return if image_url.blank?

    "background-image: url('#{image_url}'); background-position: #{position};"
  end

  def preload_image_variant_tag(image, resize_to_limit:, media: nil)
    image_url = optimized_variant_url(image, resize_to_limit: resize_to_limit)
    return if image_url.blank?

    tag.link(rel: "preload", as: "image", href: image_url, media: media)
  end

  def editorial_gallery_options(galleries)
    [["Не выбрано", ""]] + galleries.map { |gallery| [gallery.name, gallery.id] }
  end

  def editorial_rich_text(text)
    value = text.to_s
    return if value.blank?

    markup = value.match?(/<\s*[a-z][^>]*>/i) ? value : simple_format(h(value), {}, wrapper_tag: "p")

    sanitize(markup, tags: RICH_TEXT_ALLOWED_TAGS, attributes: RICH_TEXT_ALLOWED_ATTRIBUTES)
  end

  def editorial_text_block(text)
    editorial_rich_text(text)
  end

  def editorial_social_links(site_setting)
    [
      [:telegram, site_setting&.tg_url],
      [:vk, site_setting&.vk_url],
      [:instagram, site_setting&.inst_url],
      [:facebook, site_setting&.fb_url]
    ].filter_map do |name, url|
      next if url.blank?

      { name:, url:, icon_class: SOCIAL_ICON_CLASSES.fetch(name) }
    end
  end
end
