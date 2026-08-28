class ProcessImageVariantsJob < ApplicationJob
  queue_as :default

  retry_on ActiveStorage::FileNotFoundError, wait: 3.seconds, attempts: 3

  def perform(blob)
    return unless blob.variable?

    variants = [
      { resize_to_limit: [1600, 1000], format: :webp, saver: { quality: 78 } },
      { resize_to_limit: [1600, 960],  format: :webp, saver: { quality: 78 } },
      { resize_to_limit: [1400, 1100], format: :webp, saver: { quality: 78 } },
      { resize_to_limit: [1200, 1200], format: :webp, saver: { quality: 78 } },
      { resize_to_limit: [1200, 900],  format: :webp, saver: { quality: 76 } },
      { resize_to_limit: [1920, 1920], format: :webp, saver: { quality: 82 } },
      { resize_to_limit: [640, 640],   format: :webp, saver: { quality: 72 } },
      { resize_to_limit: [1920, 1920] },
      { resize_to_limit: [640, 640] }
    ]

    variants.each do |options|
      blob.variant(options).processed
    end
  end
end
