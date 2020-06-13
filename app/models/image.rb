class Image < ApplicationRecord
  belongs_to :gallery

  #mount_uploader :image, ImageUploader
  has_one_attached :image



end
