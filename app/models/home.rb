class Home < ApplicationRecord
  has_many_attached :images
  before_save :dup_check
  has_one_attached :image, :dependent => :destroy
  before_validation :ensure_section_order

  SECTION_KEYS = %w[gallery about contact].freeze

  def section_order_list
    raw = section_order.to_s.split(",").map(&:strip).reject(&:blank?)
    ordered = raw & SECTION_KEYS
    missing = SECTION_KEYS - ordered
    (ordered + missing)
  end

  def content_sections
    section_order_list
  end

  private

  def ensure_section_order
    self.section_order = section_order_list.join(",")
  end

  public
  def dup_check
    self.class.where('id != ?', self.id).update_all("visible = 'false'")
    self.class.where('id != ?', self.id).update_all("visible_cf = 'false'")

  end


end
