if @gallery.present?
  json.array!(@gallery.images) do |image|
    json.id image.id

    if image.variable?
      full_webp = image.variant(resize_to_limit: [1920, 1920], format: :webp, saver: { quality: 82 })
      preview_webp = image.variant(resize_to_limit: [640, 640], format: :webp, saver: { quality: 72 })
      full_fallback = image.variant(resize_to_limit: [1920, 1920])
      preview_fallback = image.variant(resize_to_limit: [640, 640])

      json.src_webp url_for(full_webp.processed)
      json.thumbnail_webp url_for(preview_webp.processed)
      json.src url_for(full_fallback.processed)
      json.thumbnail url_for(preview_fallback.processed)
    else
      original_url = url_for(image)
      json.src_webp original_url
      json.thumbnail_webp original_url
      json.src original_url
      json.thumbnail original_url
    end

    json.position image.position
    json.width image.metadata[:width] || 800
    json.height image.metadata[:height] || 600
  end
else
  json.error 'Gallery not found'
end
