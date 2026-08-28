class Gallery < ApplicationRecord
  has_many_attached :images

  HOMEPAGE_FIELDS = %i[
    homepage_title
    homepage_description
    homepage_meta_primary
    homepage_meta_secondary
    homepage_meta_tertiary
    homepage_footer_primary
    homepage_footer_secondary
    homepage_overlay_title
    homepage_tags
  ].freeze
  SEO_FIELDS = %i[
    seo_title
    seo_description
  ].freeze

  LEGACY_HOMEPAGE_FIELDS = %i[
    homepage_overlay_meta_primary
    homepage_overlay_meta_secondary
  ].freeze

  HOMEPAGE_DEFAULTS = {
    homepage_description: "Серия для публикации и визуального архива события.",
    homepage_meta_primary: "Москва",
    homepage_meta_secondary: "Июль 2026",
    homepage_meta_tertiary: "Репортаж",
    homepage_footer_primary: "Редакционный отбор",
    homepage_footer_secondary: "Съёмка в день события",
    homepage_tags: "backstage, детали, хроника"
  }.freeze

  store_accessor :homepage_settings, *(HOMEPAGE_FIELDS + SEO_FIELDS + LEGACY_HOMEPAGE_FIELDS)

  def ordered_images
    images.attachments.includes(:blob).sort_by { |attachment| [attachment.position || 0, attachment.created_at] }
  end

  def primary_image
    ordered_images.first
  end

  def homepage_content(key)
    value = public_send(key)
    return value if value.present?

    case key.to_sym
    when :homepage_title, :homepage_overlay_title
      name.presence || "Серия"
    else
      HOMEPAGE_DEFAULTS[key.to_sym]
    end
  end

  def homepage_tags_list
    homepage_content(:homepage_tags).to_s.split(",").map(&:strip).reject(&:blank?)
  end
end
