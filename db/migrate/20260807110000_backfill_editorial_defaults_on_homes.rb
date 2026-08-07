class BackfillEditorialDefaultsOnHomes < ActiveRecord::Migration[8.0]
  class MigrationHome < ApplicationRecord
    self.table_name = "homes"
  end

  DEFAULTS = {
    "hero_eyebrow" => "Репортаж / Documentary",
    "hero_title" => "Дмитрий Толстошеев.",
    "hero_body" => "Снимаю выставки, пресс-показы, премьеры, backstage и документальные портреты. В кадре для меня важны и событие, и воздух вокруг него.",
    "hero_primary_cta_label" => "Смотреть серии",
    "hero_secondary_cta_label" => "Запросить съёмку",
    "scroll_cue_label" => "Прокрутить",
    "headline_strip_text" => "культурные события • пресс-показы • городская среда • backstage • визуальная хроника",
    "reports_eyebrow" => "Выбранные серии",
    "reports_title" => "Последние серии и визуальные истории.",
    "reports_body" => "От музейных запусков и ночных экспозиций до тихих документальных наблюдений после события. Каждая серия собирается так, чтобы в ней работали и титульные кадры, и маленькие связующие детали.",
    "reports_intro_title" => "Серии под публикацию",
    "reports_intro_text" => "Собираю материал как редакционный разворот: титульный кадр, ритм пространства, лица в моменте и детали, которые удерживают историю между ключевыми сценами.",
    "reports_focus_title" => "Фокус",
    "reports_focus_text" => "Премьеры, выставки, пресс-показы, лекции и городские культурные события.",
    "reports_delivery_title" => "Отдача",
    "reports_delivery_text" => "Первые кадры в день события, полная серия после отбора и цветокоррекции.",
    "reports_result_title" => "Результат",
    "reports_result_text" => "Материал для редакции, архива проекта, анонсов и публикации в медиа.",
    "about_eyebrow" => "О фотографе",
    "about_title" => "Дмитрий Толстошеев снимает репортаж так, чтобы кадры работали и как документ, и как визуальная история.",
    "about_body" => "Живу и работаю в Москве. Снимаю выставки, премьеры, культурные события, городскую среду и портреты людей внутри реального контекста. В репортаже для меня важны не только факты, но и паузы между ними: взгляд, жест, свет, ожидание, усталость после события.",
    "about_body_secondary" => "Обычно работаю в двух режимах: быстрый editorial coverage для публикации в день события и более спокойная серия для сайта, каталога или архивного материала. В обоих случаях собираю материал так, чтобы из него можно было сделать и титульный кадр, и связующую визуальную хронику.",
    "about_quote" => "Мне важен кадр, который не просто доказывает, что событие состоялось, а возвращает зрителя внутрь этого момента.",
    "about_photo_caption" => "Портрет фотографа",
    "about_aside_index" => "Съёмки / 2026",
    "about_aside_title" => "Работаю для редакций, культурных институций и брендов.",
    "about_aside_text" => "Быстро отдаю пресс-пакет в день события и затем собираю полную серию для сайта, публикации или архива.",
    "about_fact_1_label" => "Подход",
    "about_fact_1_value" => "Редакционно / документально",
    "about_fact_2_label" => "Форматы",
    "about_fact_2_value" => "Reportage / Backstage / Portrait",
    "about_fact_3_label" => "Сроки",
    "about_fact_3_value" => "Превью в день события",
    "about_metric_1_value" => "12+",
    "about_metric_1_label" => "лет съёмки событий, культурных площадок и городских историй",
    "about_metric_2_value" => "24h",
    "about_metric_2_label" => "на полный отбор и передачу готовой серии после события",
    "about_metric_3_value" => "3",
    "about_metric_3_label" => "основных формата: reportage, backstage, environmental portrait",
    "about_metric_4_value" => "Live",
    "about_metric_4_label" => "работаю в плотном тайминге площадки, не ломая естественный ритм события",
    "contacts_eyebrow" => "Для съёмок",
    "contacts_title" => "Открыт для съёмок выставок, пресс-показов, событий брендов и редакционных заданий.",
    "contacts_body" => "Если нужен фотограф, который может быстро собрать пресс-пакет и при этом удержать более глубокую визуальную историю, напишите заранее или прямо в день события. Отдельно беру backstage, портреты в среде и короткие документальные серии для публикаций.",
    "contacts_card_eyebrow" => "Контакты",
    "contacts_location_label" => "География",
    "contacts_location_value" => "База в Москве, съёмки по России",
    "contacts_phone_label" => "Телефон",
    "contacts_phone_value" => "+7 999 420-18-24",
    "contacts_email_label" => "Почта",
    "contacts_email_value" => "hello@tolstosheev.photo",
    "contacts_social_label" => "Соцсети"
  }.freeze

  def up
    say_with_time "Backfilling editorial defaults into homes.editorial_settings" do
      MigrationHome.find_each do |home|
        settings = home.editorial_settings.is_a?(Hash) ? home.editorial_settings.deep_stringify_keys : {}
        updated_settings = settings.dup

        DEFAULTS.each do |key, value|
          updated_settings[key] = value if updated_settings[key].blank?
        end

        next if updated_settings == settings

        home.update_columns(editorial_settings: updated_settings, updated_at: Time.current)
      end
    end
  end

  def down
  end
end
