class Gallery < ApplicationRecord
  #has_many :images, dependent: :destroy
  has_many_attached :images

  def self.sizes
    {
        thumbnail: { resize: "100x100" },
        hero1:     { resize: "1000x500" }
    }
  end

  def sized(size)
    self.images.variant(Image.sizes[size]).processed
  end


end
