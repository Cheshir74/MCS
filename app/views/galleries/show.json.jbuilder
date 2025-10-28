if @gallery.present?
  json.array!(@gallery.images) do |image|
    json.id image.id
    json.src url_for(image)
    json.thumbnail url_for(image.variant(resize_to_limit: [640, 640]).processed)
    json.position image.position
    json.width image.metadata[:width] || 800
    json.height image.metadata[:height] || 600
  end
else
  json.error 'Gallery not found'
end
