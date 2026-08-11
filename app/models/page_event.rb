class PageEvent < ApplicationRecord
  belongs_to :page_view

  scope :since, ->(time) { where(occurred_at: time..) }

  validates :event_type, :path, :occurred_at, presence: true
end
