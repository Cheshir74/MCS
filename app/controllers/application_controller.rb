class ApplicationController < ActionController::Base
  require "digest"
  require "securerandom"

  protect_from_forgery with: :exception

  before_action :getglobalset
  before_action :authenticate_user!
  before_action :getGalleryNav
  before_action :turbo_frame_request_variant
  before_action :track_analytics_page_view


  def after_sign_in_path_for(resource)
    home_path
  end

  def render_modal(title: "", body: "", footer: "")
    render(partial: '/partials/modal', locals: { title: title, body: body, footer: footer })
  end

  def turbo_frame_request_variant
    request.variant = :turbo_frame if turbo_frame_request?
  end

  private

  def track_analytics_page_view
    return unless analytics_trackable_request?

    visitor_id = cookies.signed[:visitor_id].presence || SecureRandom.uuid
    cookies.permanent.signed[:visitor_id] = visitor_id
    @analytics_page_view = PageView.create!(
      visitor_id: visitor_id,
      path: request.path,
      full_path: request.fullpath,
      controller_name: controller_name,
      action_name: action_name,
      referrer: request.referer,
      user_agent: request.user_agent.to_s.first(500),
      ip_hash: analytics_ip_hash(request.remote_ip),
      started_at: Time.current
    )
  rescue StandardError => e
    Rails.logger.debug("[Analytics] page view skipped: #{e.class}: #{e.message}")
  end

  def analytics_trackable_request?
    request.get? &&
      request.format.html? &&
      !request.xhr? &&
      !turbo_frame_request? &&
      !request.path.start_with?("/admin") &&
      defined?(PageView) &&
      ActiveRecord::Base.connection.data_source_exists?("page_views")
  end

  def analytics_ip_hash(ip)
    Digest::SHA256.hexdigest("#{Rails.application.secret_key_base}:#{ip}")
  end

  def getGalleryNav
    @galleryNav = Gallery.where(visible: true)
  end

  def getglobalset
    @site_setting = SiteSetting.first || SiteSetting.create!
  end
  

  end
