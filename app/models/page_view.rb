class PageView < ApplicationRecord
  has_many :page_events, dependent: :destroy

  scope :recent, -> { order(started_at: :desc) }
  scope :since, ->(time) { where(started_at: time..) }

  validates :visitor_id, :path, :full_path, :started_at, presence: true
end
