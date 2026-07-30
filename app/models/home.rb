class Home < ApplicationRecord
  has_many_attached :images
  has_one_attached :image, dependent: :destroy

  before_validation :ensure_section_order
  before_save :ensure_single_visible_home, if: :visible?

  belongs_to :editorial_lead_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_feature_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_compact_left_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_compact_right_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_series_first_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_series_second_gallery, class_name: "Gallery", optional: true
  belongs_to :editorial_series_third_gallery, class_name: "Gallery", optional: true

  SECTION_KEYS = %w[gallery about contact].freeze
  DESIGN_VARIANTS = %w[legacy editorial].freeze
  EDITORIAL_GALLERY_FIELDS = %i[
    editorial_lead_gallery_id
    editorial_feature_gallery_id
    editorial_compact_left_gallery_id
    editorial_compact_right_gallery_id
    editorial_series_first_gallery_id
    editorial_series_second_gallery_id
    editorial_series_third_gallery_id
  ].freeze
  EDITORIAL_GALLERY_LABELS = {
    editorial_lead_gallery_id: "Главная серия",
    editorial_feature_gallery_id: "Правая акцентная серия",
    editorial_compact_left_gallery_id: "Правая малая серия слева",
    editorial_compact_right_gallery_id: "Правая малая серия справа",
    editorial_series_first_gallery_id: "Нижняя серия 1",
    editorial_series_second_gallery_id: "Нижняя серия 2",
    editorial_series_third_gallery_id: "Нижняя серия 3"
  }.freeze
  EDITORIAL_FIELDS = %i[
    hero_eyebrow
    hero_title
    hero_body
    hero_primary_cta_label
    hero_secondary_cta_label
    scroll_cue_label
    headline_strip_text
    reports_eyebrow
    reports_title
    reports_body
    reports_intro_title
    reports_intro_text
    reports_focus_title
    reports_focus_text
    reports_delivery_title
    reports_delivery_text
    reports_result_title
    reports_result_text
    about_eyebrow
    about_title
    about_body
    about_body_secondary
    about_quote
    about_photo_caption
    about_aside_index
    about_aside_title
    about_aside_text
    about_fact_1_label
    about_fact_1_value
    about_fact_2_label
    about_fact_2_value
    about_fact_3_label
    about_fact_3_value
    about_metric_1_value
    about_metric_1_label
    about_metric_2_value
    about_metric_2_label
    about_metric_3_value
    about_metric_3_label
    about_metric_4_value
    about_metric_4_label
    contacts_eyebrow
    contacts_title
    contacts_body
    contacts_card_eyebrow
    contacts_location_label
    contacts_location_value
    contacts_phone_label
    contacts_phone_value
    contacts_email_label
    contacts_email_value
    contacts_social_label
  ].freeze
  EDITORIAL_DEFAULTS = {
    hero_eyebrow: "Репортаж / Documentary",
    hero_title: "Дмитрий Толстошеев.",
    hero_body: "Снимаю выставки, пресс-показы, премьеры, backstage и документальные портреты. В кадре для меня важны и событие, и воздух вокруг него.",
    hero_primary_cta_label: "Смотреть серии",
    hero_secondary_cta_label: "Запросить съёмку",
    scroll_cue_label: "Прокрутить",
    headline_strip_text: "культурные события • пресс-показы • городская среда • backstage • визуальная хроника",
    reports_eyebrow: "Выбранные серии",
    reports_title: "Последние серии и визуальные истории.",
    reports_body: "От музейных запусков и ночных экспозиций до тихих документальных наблюдений после события. Каждая серия собирается так, чтобы в ней работали и титульные кадры, и маленькие связующие детали.",
    reports_intro_title: "Серии под публикацию",
    reports_intro_text: "Собираю материал как редакционный разворот: титульный кадр, ритм пространства, лица в моменте и детали, которые удерживают историю между ключевыми сценами.",
    reports_focus_title: "Фокус",
    reports_focus_text: "Премьеры, выставки, пресс-показы, лекции и городские культурные события.",
    reports_delivery_title: "Отдача",
    reports_delivery_text: "Первые кадры в день события, полная серия после отбора и цветокоррекции.",
    reports_result_title: "Результат",
    reports_result_text: "Материал для редакции, архива проекта, анонсов и публикации в медиа.",
    about_eyebrow: "О фотографе",
    about_title: "Дмитрий Толстошеев снимает репортаж так, чтобы кадры работали и как документ, и как визуальная история.",
    about_body: "Живу и работаю в Москве. Снимаю выставки, премьеры, культурные события, городскую среду и портреты людей внутри реального контекста. В репортаже для меня важны не только факты, но и паузы между ними: взгляд, жест, свет, ожидание, усталость после события.",
    about_body_secondary: "Обычно работаю в двух режимах: быстрый editorial coverage для публикации в день события и более спокойная серия для сайта, каталога или архивного материала. В обоих случаях собираю материал так, чтобы из него можно было сделать и титульный кадр, и связующую визуальную хронику.",
    about_quote: "Мне важен кадр, который не просто доказывает, что событие состоялось, а возвращает зрителя внутрь этого момента.",
    about_photo_caption: "Портрет фотографа",
    about_aside_index: "Съёмки / 2026",
    about_aside_title: "Работаю для редакций, культурных институций и брендов.",
    about_aside_text: "Быстро отдаю пресс-пакет в день события и затем собираю полную серию для сайта, публикации или архива.",
    about_fact_1_label: "Подход",
    about_fact_1_value: "Редакционно / документально",
    about_fact_2_label: "Форматы",
    about_fact_2_value: "Reportage / Backstage / Portrait",
    about_fact_3_label: "Сроки",
    about_fact_3_value: "Превью в день события",
    about_metric_1_value: "12+",
    about_metric_1_label: "лет съёмки событий, культурных площадок и городских историй",
    about_metric_2_value: "24h",
    about_metric_2_label: "на полный отбор и передачу готовой серии после события",
    about_metric_3_value: "3",
    about_metric_3_label: "основных формата: reportage, backstage, environmental portrait",
    about_metric_4_value: "Live",
    about_metric_4_label: "работаю в плотном тайминге площадки, не ломая естественный ритм события",
    contacts_eyebrow: "Для съёмок",
    contacts_title: "Открыт для съёмок выставок, пресс-показов, событий брендов и редакционных заданий.",
    contacts_body: "Если нужен фотограф, который может быстро собрать пресс-пакет и при этом удержать более глубокую визуальную историю, напишите заранее или прямо в день события. Отдельно беру backstage, портреты в среде и короткие документальные серии для публикаций.",
    contacts_card_eyebrow: "Контакты",
    contacts_location_label: "География",
    contacts_location_value: "База в Москве, съёмки по России",
    contacts_phone_label: "Телефон",
    contacts_phone_value: "+7 999 420-18-24",
    contacts_email_label: "Почта",
    contacts_email_value: "hello@tolstosheev.photo",
    contacts_social_label: "Соцсети"
  }.freeze

  store_accessor :editorial_settings, *EDITORIAL_FIELDS

  validates :design_variant, inclusion: { in: DESIGN_VARIANTS }

  after_initialize :set_defaults, if: :new_record?

  def section_order_list
    raw = section_order.to_s.split(",").map(&:strip).reject(&:blank?)
    ordered = raw & SECTION_KEYS
    missing = SECTION_KEYS - ordered
    ordered + missing
  end

  def content_sections
    section_order_list
  end

  def ordered_images
    images.attachments.includes(:blob).sort_by { |attachment| [attachment.position || 0, attachment.created_at] }
  end

  def editorial?
    design_variant == "editorial"
  end

  def legacy?
    !editorial?
  end

  def editorial_content(key)
    value = public_send(key)
    value.present? ? value : EDITORIAL_DEFAULTS[key.to_sym]
  end

  def editorial_fact_pairs
    [
      [editorial_content(:about_fact_1_label), editorial_content(:about_fact_1_value)],
      [editorial_content(:about_fact_2_label), editorial_content(:about_fact_2_value)],
      [editorial_content(:about_fact_3_label), editorial_content(:about_fact_3_value)]
    ]
  end

  def editorial_metrics
    [
      [editorial_content(:about_metric_1_value), editorial_content(:about_metric_1_label)],
      [editorial_content(:about_metric_2_value), editorial_content(:about_metric_2_label)],
      [editorial_content(:about_metric_3_value), editorial_content(:about_metric_3_label)],
      [editorial_content(:about_metric_4_value), editorial_content(:about_metric_4_label)]
    ]
  end

  private

  def ensure_section_order
    self.section_order = section_order_list.join(",")
  end

  def ensure_single_visible_home
    self.class.where.not(id: id).where(visible: true).update_all(visible: false)
  end

  def set_defaults
    self.design_variant = "legacy" if design_variant.blank?
    self.section_order = SECTION_KEYS.join(",") if section_order.blank?
  end
end
