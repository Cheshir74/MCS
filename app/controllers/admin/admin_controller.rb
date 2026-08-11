class Admin::AdminController < ApplicationController
  require "open3"
  require "socket"
  require "timeout"
  require "etc"
  require "set"
  require "rbconfig"

  include ActionView::Helpers::NumberHelper

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to home_path, :alert => exception.message
  end
  authorize_resource
  layout "admin"

  before_action :load_admin_shell_context
  before_action :set_site_setting, only: [:show, :edit, :update, :service]
  before_action :load_home_options, only: [:index, :show, :edit]
  # before_action :set_admin_setting, only: [:show, :edit, :update]


  def edit
    # Загружаем настройки сайта
  end

  def update
    if @site_setting.update(site_setting_params)
      redirect_to admin_root_path, notice: 'Настройки сайта успешно обновлены.'
    else
      render :edit, alert: 'Не удалось обновить настройки сайта.'
    end
  end



  def index
    @site_setting = SiteSetting.first || SiteSetting.create!
  end

  def show
    @site_setting = SiteSetting.first || SiteSetting.create!
  end

  def service
    @service_stats = build_service_stats
  end


  protected

  def check_admin
    redirect_to root_path, alert: "You haven't permission Admin"
  end

  def set_site_setting
    # Загрузка первой записи настроек сайта (если настройки единственные)
    @site_setting = SiteSetting.first || SiteSetting.new
  end

  #def set_admin_setting
  #  @admin_edit = Admin.first || Admin.create!
  #end

  def site_setting_params
    params.require(:site_setting).permit(
      :name_site,
      :tg_url,
      :fb_url,
      :inst_url,
      :vk_url,
      :yn_verification_pri,
      :yn_verification_sec,
      :footer,
      :email_contact,
      :email_login,
      :email_domain,
      :email_password,
      :email_address,
      :email_port,
      :email_tls,
      :email_ssl,
      :pages_enabled,
      :registrations_enabled,
      :favicon,
      :remove_favicon,
      :logo,
      :remove_logo
    )
  end

  def load_home_options
    @homes = Home.order(created_at: :desc)
    @current_home = @homes.find(&:visible)
  end

  def load_admin_shell_context
    @admin_featured_home = Home.find_by(visible: true)
    @admin_counts = {
      homes: Home.count,
      published_homes: Home.where(visible: true).count,
      editorial_homes: Home.where(design_variant: "editorial").count,
      galleries: Gallery.count,
      visible_galleries: Gallery.where(visible: true).count,
      pages: Page.count,
      users: User.count
    }
  end

  def build_service_stats
    disk = disk_usage
    dependencies = dependency_status
    load = load_average
    memory = memory_usage
    server_ips = server_ip_addresses
    analytics = analytics_stats
    heatmap = heatmap_stats

    {
      overview: [
        { label: "Load average", value: load[:summary], note: load[:note], tone: load[:tone] },
        { label: "Memory", value: memory[:available], note: memory[:note], tone: memory[:tone] },
        { label: "Free disk", value: disk[:free], note: disk[:note], tone: disk[:tone] },
        { label: "Dependencies", value: dependencies[:summary], note: dependencies[:note], tone: dependencies[:tone] },
        { label: "Server IP", value: server_ips.first || "Unavailable", note: server_ips.drop(1).join(", ").presence || "Primary interface", tone: server_ips.any? ? "accent" : "warning" }
      ],
      versions: [
        ["Ruby", RUBY_VERSION],
        ["Rails", Rails.version],
        ["Rack env", Rails.env],
        ["Linux", linux_release],
        ["Database", database_version],
        ["Bundler", Bundler::VERSION],
        ["Platform", RUBY_PLATFORM]
      ],
      dependencies: dependencies,
      disk: disk,
      load: load,
      memory: memory,
      ip_addresses: server_ips,
      analytics: analytics,
      heatmap: heatmap,
      checked_at: Time.current
    }
  end

  def load_average
    processors = Etc.respond_to?(:nprocessors) ? Etc.nprocessors : nil
    raw = if File.exist?("/proc/loadavg")
            File.read("/proc/loadavg").split.first(3).join(" / ")
          else
            command_output("uptime").to_s[/load averages?:\s*(.+)\z/i, 1].to_s.strip
          end

    values = raw.scan(/\d+(?:\.\d+)?/).first(3).map(&:to_f)
    one_minute = values.first
    pressure = processors && one_minute ? one_minute / processors : nil
    tone = if pressure.nil?
             "muted"
           elsif pressure < 0.7
             "success"
           elsif pressure < 1.0
             "accent"
           else
             "warning"
           end

    {
      summary: raw.presence || "Unavailable",
      note: processors ? "#{processors} CPU thread#{'s' unless processors == 1}" : "CPU count unavailable",
      tone: tone
    }
  rescue StandardError => e
    { summary: "Unavailable", note: e.message, tone: "warning" }
  end

  def disk_usage
    output = command_output("df", "-Pk", Rails.root.to_s)
    fields = output.lines.last.to_s.split
    total_kb = fields[1].to_i
    used_kb = fields[2].to_i
    free_kb = fields[3].to_i
    used_percent = fields[4].to_s.delete("%").to_i

    return { free: "Unavailable", note: "Disk command returned no data", tone: "warning", rows: [] } if total_kb.zero?

    {
      free: number_to_human_size(free_kb.kilobytes),
      note: "#{used_percent}% used of #{number_to_human_size(total_kb.kilobytes)}",
      tone: used_percent < 75 ? "success" : used_percent < 90 ? "accent" : "warning",
      rows: [
        ["Total", number_to_human_size(total_kb.kilobytes)],
        ["Used", number_to_human_size(used_kb.kilobytes)],
        ["Free", number_to_human_size(free_kb.kilobytes)]
      ]
    }
  rescue StandardError => e
    { free: "Unavailable", note: e.message, tone: "warning", rows: [] }
  end

  def memory_usage
    meminfo = File.readlines("/proc/meminfo").each_with_object({}) do |line, values|
      key, value = line.split(":", 2)
      values[key] = value.to_s.scan(/\d+/).first.to_i.kilobytes
    end

    total = meminfo["MemTotal"].to_i
    available = meminfo["MemAvailable"].to_i
    used_percent = total.positive? ? (((total - available).to_f / total) * 100).round : 0

    {
      available: total.positive? ? number_to_human_size(available) : "Unavailable",
      note: total.positive? ? "#{used_percent}% used of #{number_to_human_size(total)}" : "Linux meminfo unavailable",
      tone: used_percent < 75 ? "success" : used_percent < 90 ? "accent" : "warning",
      rows: [
        ["Total", total.positive? ? number_to_human_size(total) : "Unavailable"],
        ["Available", available.positive? ? number_to_human_size(available) : "Unavailable"],
        ["Used", total.positive? ? "#{used_percent}%" : "Unavailable"]
      ]
    }
  rescue StandardError => e
    { available: "Unavailable", note: e.message, tone: "warning", rows: [] }
  end

  def dependency_status
    missing = Bundler.definition.missing_specs
    dependencies = Bundler.definition.dependencies
    missing_names = missing.map(&:name).to_set
    runtime_groups = [:default, :production]
    sections = [
      dependency_section("Critical runtime", dependencies, runtime_groups, missing_names),
      dependency_section("Development", dependencies, [:development], missing_names),
      dependency_section("Test", dependencies, [:test], missing_names)
    ]
    critical_missing = sections.first[:missing].any?
    optional_missing = sections.drop(1).any? { |section| section[:missing].any? }

    {
      summary: missing.empty? ? "Complete" : "#{missing.size} missing",
      note: critical_missing ? "Critical runtime gems are missing." : optional_missing ? "Only non-runtime groups have gaps." : "All bundle specs are available.",
      tone: critical_missing ? "warning" : optional_missing ? "accent" : "success",
      missing: missing.map(&:full_name),
      sections: sections
    }
  rescue StandardError => e
    { summary: "Unknown", note: e.message, tone: "warning", missing: [], sections: [] }
  end

  def dependency_section(label, dependencies, groups, missing_names)
    scoped = dependencies.select { |dependency| (dependency.groups & groups).any? }
    missing = scoped.select { |dependency| missing_names.include?(dependency.name) }.map(&:name).uniq
    {
      label: label,
      summary: missing.any? ? "#{missing.size}/#{scoped.size} missing" : "#{scoped.size}/#{scoped.size} ready",
      tone: missing.any? ? "warning" : "success",
      missing: missing
    }
  end

  def database_version
    ActiveRecord::Base.connection.select_value("SELECT version()").to_s.split.first(2).join(" ")
  rescue StandardError
    ActiveRecord::Base.connection.adapter_name
  end

  def linux_release
    return RbConfig::CONFIG["host_os"] unless File.exist?("/etc/os-release")

    values = File.readlines("/etc/os-release").each_with_object({}) do |line, data|
      key, value = line.strip.split("=", 2)
      data[key] = value.to_s.delete_prefix("\"").delete_suffix("\"")
    end
    values["PRETTY_NAME"].presence || values["NAME"].presence || RbConfig::CONFIG["host_os"]
  rescue StandardError
    RbConfig::CONFIG["host_os"]
  end

  def server_ip_addresses
    Socket.ip_address_list.filter_map do |address|
      next unless address.ipv4? && !address.ipv4_loopback?

      address.ip_address
    end.uniq
  rescue StandardError
    []
  end

  def analytics_stats
    return analytics_unavailable("Page view table is not migrated yet.") unless ActiveRecord::Base.connection.data_source_exists?("page_views")

    range_start = 7.days.ago
    scope = PageView.since(range_start)
    views_count = scope.count
    visitors_count = scope.distinct.count(:visitor_id)
    average_duration = scope.where.not(duration_seconds: nil).average(:duration_seconds).to_i
    top_pages = scope
      .group(:path)
      .order(Arel.sql("COUNT(*) DESC"))
      .limit(8)
      .pluck(
        :path,
        Arel.sql("COUNT(*) AS views_count"),
        Arel.sql("COUNT(DISTINCT visitor_id) AS visitors_count"),
        Arel.sql("AVG(duration_seconds) AS average_duration")
      )
      .map do |path, views, visitors, duration|
        {
          path: path,
          views: views.to_i,
          visitors: visitors.to_i,
          average_duration: duration.to_i
        }
      end

    {
      available: true,
      period: "Last 7 days",
      views: views_count,
      visitors: visitors_count,
      average_duration: average_duration,
      top_pages: top_pages
    }
  rescue StandardError => e
    analytics_unavailable(e.message)
  end

  def analytics_unavailable(message)
    {
      available: false,
      period: "Last 7 days",
      views: 0,
      visitors: 0,
      average_duration: 0,
      top_pages: [],
      message: message
    }
  end

  def heatmap_stats
    return heatmap_unavailable("Heatmap table is not migrated yet.") unless ActiveRecord::Base.connection.data_source_exists?("page_events")

    range_start = 7.days.ago
    click_scope = PageEvent.since(range_start).where(event_type: "click")
    page_path = click_scope.group(:path).order(Arel.sql("COUNT(*) DESC")).limit(1).count.keys.first
    return heatmap_unavailable("No click events recorded yet.") if page_path.blank?

    clicks = click_scope
      .where(path: page_path)
      .where.not(x_percent: nil, y_percent: nil)
      .order(occurred_at: :desc)
      .limit(80)
      .pluck(:x_percent, :y_percent, :element_name, :element_label)
      .map do |x, y, element, label|
        {
          x: x.to_f.round(2),
          y: y.to_f.round(2),
          element: element,
          label: label
        }
      end
    top_targets = click_scope
      .where(path: page_path)
      .group(:element_name, :element_label)
      .order(Arel.sql("COUNT(*) DESC"))
      .limit(5)
      .count
      .map do |(element, label), count|
        {
          element: element.presence || "element",
          label: label.presence || "Unlabeled click",
          clicks: count
        }
      end
    zone_counts = {
      top: clicks.count { |click| click[:y] <= 33.33 },
      middle: clicks.count { |click| click[:y] > 33.33 && click[:y] <= 66.66 },
      bottom: clicks.count { |click| click[:y] > 66.66 }
    }
    scroll_depth = PageEvent.since(range_start).where(path: page_path, event_type: "scroll_depth").average(:scroll_percent).to_i

    {
      available: true,
      period: "Last 7 days",
      path: page_path,
      clicks_count: click_scope.where(path: page_path).count,
      average_scroll_depth: scroll_depth,
      clicks: clicks,
      top_targets: top_targets,
      zone_counts: zone_counts
    }
  rescue StandardError => e
    heatmap_unavailable(e.message)
  end

  def heatmap_unavailable(message)
    {
      available: false,
      period: "Last 7 days",
      path: nil,
      clicks_count: 0,
      average_scroll_depth: 0,
      clicks: [],
      top_targets: [],
      zone_counts: { top: 0, middle: 0, bottom: 0 },
      message: message
    }
  end

  def command_output(*command)
    stdout = ""
    Timeout.timeout(2) do
      stdout, = Open3.capture3(*command)
    end
    stdout
  end

end
