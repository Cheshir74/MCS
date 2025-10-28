module GalleriesHelper
  FULL_WEBP_TRANSFORM   = { resize_to_limit: [1920, 1920], format: :webp, saver: { quality: 82 } }.freeze
  PREVIEW_WEBP_TRANSFORM = { resize_to_limit: [640, 640], format: :webp, saver: { quality: 72 } }.freeze
  FULL_FALLBACK_TRANSFORM = { resize_to_limit: [1920, 1920] }.freeze
  PREVIEW_FALLBACK_TRANSFORM = { resize_to_limit: [640, 640] }.freeze

  def gallery_full_webp_url(image)
    gallery_variant_url(image, FULL_WEBP_TRANSFORM)
  end

  def gallery_preview_webp_url(image)
    gallery_variant_url(image, PREVIEW_WEBP_TRANSFORM)
  end

  def gallery_full_fallback_url(image)
    gallery_variant_url(image, FULL_FALLBACK_TRANSFORM)
  end

  def gallery_preview_fallback_url(image)
    gallery_variant_url(image, PREVIEW_FALLBACK_TRANSFORM)
  end

  private

  def gallery_variant_url(image, transformations)
    return url_for(image) unless image.respond_to?(:variant) && image.variable?

    variant = image.variant(transformations)
    processed = variant.processed
    url_for(processed)
  rescue StandardError => e
    Rails.logger&.warn("[GalleryVariants] Variant generation failed for #{image.filename}: #{e.class} #{e.message}")
    url_for(image)
  end
end
