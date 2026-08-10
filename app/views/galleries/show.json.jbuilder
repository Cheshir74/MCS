if @gallery.present?
  json.array!(@gallery.ordered_images) do |image|
    json.id image.id

    json.src_webp gallery_full_webp_url(image)
    json.thumbnail_webp gallery_preview_webp_url(image)
    json.src gallery_full_fallback_url(image)
    json.thumbnail gallery_preview_fallback_url(image)

    json.position image.position
    json.width image.metadata[:width] || 800
    json.height image.metadata[:height] || 600
  end
else
  json.error 'Gallery not found'
end
