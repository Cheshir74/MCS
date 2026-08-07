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

  def editorial_media_style(image, resize_to_limit: [2200, 1400], position: "center center")
    return if image.blank?
    return if image.respond_to?(:attached?) && !image.attached?

    "background-image: url('#{url_for(image.variant(resize_to_limit: resize_to_limit))}'); background-position: #{position};"
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
