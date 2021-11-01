json.array! @gallery.images.each do |image|
    json.id image.id
    json.src url_for(image)
    json.position image.position
    json.merge!  image.blob.metadata
end