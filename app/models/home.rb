class Home < ApplicationRecord
  has_many_attached :images
  before_save :dup_check
  has_one_attached :image, :dependent => :destroy

  def dup_check
    self.class.where('id != ?', self.id).update_all("visible = 'false'")
  end


end
