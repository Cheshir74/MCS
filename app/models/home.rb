class Home < ApplicationRecord
  has_many_attached :images
  before_save :dup_check

  def dup_check
    self.class.where('id != ?', self.id).update_all("visible = 'false'")
  end


end
