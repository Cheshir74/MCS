namespace :gallery do
  desc "Regenerate WebP and fallback variants for gallery images (set RESET_VARIANTS=1 to clear existing variant records first)"
  task regenerate_variants: :environment do
    attachments = ActiveStorage::Attachment.includes(:blob).where(record_type: "Gallery", name: "images")
    total = attachments.count
    puts "Processing #{total} gallery images..."

    attachments.find_each.with_index(1) do |attachment, index|
      blob = attachment.blob
      print "[#{index}/#{total}] #{blob.filename} "

      unless blob.variable?
        puts "- skipped (non-variable)"
        next
      end

      ActiveStorage::VariantRecord.where(blob_id: blob.id).delete_all if ENV["RESET_VARIANTS"].present?

      begin
        [
          { label: "full_webp", options: { resize_to_limit: [1920, 1920], format: :webp, saver: { quality: 82 } } },
          { label: "preview_webp", options: { resize_to_limit: [640, 640], format: :webp, saver: { quality: 72 } } },
          { label: "full_fallback", options: { resize_to_limit: [1920, 1920] } },
          { label: "preview_fallback", options: { resize_to_limit: [640, 640] } }
        ].each do |variant|
          blob.variant(variant[:options]).processed
        end

        puts "- regenerated"
      rescue => e
        puts "- failed (#{e.class}: #{e.message})"
      end
    end
  end
end
