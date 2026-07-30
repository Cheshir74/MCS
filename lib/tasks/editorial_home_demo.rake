namespace :demo do
  desc "Create or refresh an editorial demo home page in development"
  task editorial_home: :environment do
    unless Rails.env.development?
      raise "demo:editorial_home can only run in development"
    end

    site_setting = SiteSetting.first || SiteSetting.create!
    source_home = Home.find_by(visible: true) || Home.first
    galleries = Gallery.order(:id).to_a

    if galleries.empty?
      7.times do |index|
        galleries << Gallery.create!(name: "Demo Series #{index + 1}", visible: true)
      end
    end

    selected_galleries = Array.new(7) { |index| galleries[index % galleries.length] }
    gallery_titles = [
      "Человек внутри экспозиции: свет, маршрут и ощущение масштаба.",
      "Первые минуты после открытия: плотный поток и новый ритм пространства.",
      "Контекст до и после главной сцены.",
      "Тихие кадры, которые держат ритм всей истории.",
      "Первые кадры потока.",
      "Backstage перед открытием.",
      "Тихие связующие кадры."
    ]
    gallery_descriptions = [
      "Серия с открытия мультимедийного проекта, где важен не только объект, но и то, как зритель входит в пространство, задерживается в свете и становится частью общей сцены.",
      "Небольшой блок о реакции публики в момент запуска.",
      "Жесты, свет и след движения в пространстве.",
      "Воздух между ключевыми моментами и материал для связки серии.",
      nil,
      nil,
      nil
    ]
    gallery_tags = [
      "открытие, вечер, поток",
      "событие, запуск, публика",
      "backstage, детали, сборка",
      "контекст, паузы, архив",
      "открытие, вечер, поток",
      "backstage, детали, сборка",
      "контекст, паузы, архив"
    ]

    selected_galleries.each_with_index do |gallery, index|
      gallery.assign_attributes(
        homepage_title: gallery.homepage_title.presence || gallery_titles[index],
        homepage_overlay_title: gallery.homepage_overlay_title.presence || gallery_titles[index],
        homepage_description: gallery.homepage_description.presence || gallery_descriptions[index] || Gallery::HOMEPAGE_DEFAULTS[:homepage_description],
        homepage_meta_primary: gallery.homepage_meta_primary.presence || (index.zero? ? "Москва" : ["Ночной показ", "Backstage", "Документальный план", "Вечер открытия", "Подготовка площадки", "После кульминации"][index - 1]),
        homepage_meta_secondary: gallery.homepage_meta_secondary.presence || ["Июль 2026", "Событие / запуск", "Детали", "Паузы", "Первые гости", "До открытия", "Документальный план"][index],
        homepage_meta_tertiary: gallery.homepage_meta_tertiary.presence || ["Открытие выставки", nil, nil, nil, nil, nil, nil][index],
        homepage_footer_primary: gallery.homepage_footer_primary.presence || ["18 кадров в серии", "Съёмка в день события", "Связующие кадры", "Архив проекта", "Редакционный отбор", "Живое присутствие", "Публикационный набор"][index],
        homepage_footer_secondary: gallery.homepage_footer_secondary.presence || ["Редакционный отбор", "Быстрая отдача", "Живое присутствие", "Публикационный набор", "Первые кадры", "До открытия", "Тихий ритм"][index],
        homepage_overlay_meta_primary: gallery.homepage_overlay_meta_primary.presence || ["Москва", "Ночной показ", "Backstage", "Документальный план", "Вечер открытия", "Подготовка площадки", "После кульминации"][index],
        homepage_overlay_meta_secondary: gallery.homepage_overlay_meta_secondary.presence || ["Открытие выставки", "Запуск", "Детали", "Паузы", "Первые гости", "До открытия", "Связующий план"][index],
        homepage_tags: gallery.homepage_tags.presence || gallery_tags[index]
      )
      gallery.save! if gallery.changed?
    end

    hero_title = source_home&.title.to_s.strip.presence || Home::EDITORIAL_DEFAULTS[:hero_title]
    hero_title = "#{hero_title.delete_suffix('.') }."

    demo_home = Home.find_or_initialize_by(title: "Demo Editorial Home 2026")
    demo_home.assign_attributes(
      design_variant: "editorial",
      visible: true,
      visible_cf: false,
      body: source_home&.body,
      title_block1: source_home&.title_block1,
      body_block1: source_home&.body_block1,
      gallery_id: source_home&.gallery_id,
      hero_eyebrow: "Репортаж / Documentary",
      hero_title:,
      hero_body: source_home&.body.to_s.strip.presence || Home::EDITORIAL_DEFAULTS[:hero_body],
      contacts_email_value: site_setting.email_contact.to_s.strip.presence || Home::EDITORIAL_DEFAULTS[:contacts_email_value],
      editorial_lead_gallery: selected_galleries[0],
      editorial_feature_gallery: selected_galleries[1],
      editorial_compact_left_gallery: selected_galleries[2],
      editorial_compact_right_gallery: selected_galleries[3],
      editorial_series_first_gallery: selected_galleries[4],
      editorial_series_second_gallery: selected_galleries[5],
      editorial_series_third_gallery: selected_galleries[6]
    )
    demo_home.save!

    if source_home&.image&.attached? && !demo_home.image.attached?
      demo_home.image.attach(source_home.image.blob)
    end

    if source_home&.images&.attached? && demo_home.images.blank?
      source_home.ordered_images.each do |image|
        demo_home.images.attach(image.blob)
      end
    end

    puts "Editorial demo home ready: ##{demo_home.id} (published in development)"
  end
end
