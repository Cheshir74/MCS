if @gallery.present?
  json.array!(@gallery.images) do |image|
    json.id image.id

    if image.variable?
      full_variant = image.variant(resize_to_limit: [1920, 1920], format: :webp, saver: { quality: 82 })
      preview_variant = image.variant(resize_to_limit: [640, 640], format: :webp, saver: { quality: 72 })
      json.src url_for(full_variant.processed)
      json.thumbnail url_for(preview_variant.processed)
    else
      json.src url_for(image)
      json.thumbnail url_for(image)
    end

    json.position image.position
    json.width image.metadata[:width] || 800
    json.height image.metadata[:height] || 600
  end
else
  json.error 'Gallery not found'
end
