class Image < ApplicationRecord
  has_one_attached :image

  validates :gallery_id, presence: true
end
