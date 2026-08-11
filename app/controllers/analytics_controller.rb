class AnalyticsController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :track_analytics_page_view

  MAX_EVENTS_PER_REQUEST = 25

  def duration
    page_view = PageView.find_signed(params[:id], purpose: :analytics_duration)
    seconds = params[:duration_seconds].to_i.clamp(0, 86_400)
    page_view.update(duration_seconds: seconds)
    head :no_content
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
    head :not_found
  end

  def events
    page_view = PageView.find_signed(params[:id], purpose: :analytics_duration)
    return head :no_content unless page_events_available?

    normalized_events.first(MAX_EVENTS_PER_REQUEST).each do |event|
      page_view.page_events.create!(
        event_type: event[:event_type].to_s.in?(%w[click scroll_depth]) ? event[:event_type] : "unknown",
        path: page_view.path,
        x_percent: bounded_decimal(event[:x_percent]),
        y_percent: bounded_decimal(event[:y_percent]),
        scroll_percent: event[:scroll_percent].to_i.clamp(0, 100),
        viewport_width: event[:viewport_width].to_i.clamp(0, 10_000),
        viewport_height: event[:viewport_height].to_i.clamp(0, 10_000),
        element_name: event[:element_name].to_s.first(40),
        element_label: event[:element_label].to_s.first(120),
        occurred_at: Time.current
      )
    end
    head :no_content
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
    head :not_found
  end

  private

  def bounded_decimal(value)
    value.to_f.clamp(0.0, 100.0).round(3)
  end

  def normalized_events
    raw_events = params[:events]
    events = case raw_events
             when Array
               raw_events
             when ActionController::Parameters
               raw_events.to_unsafe_h.sort_by { |key, _value| key.to_i }.map(&:last)
             when Hash
               raw_events.sort_by { |key, _value| key.to_i }.map(&:last)
             else
               []
             end

    events.map do |event|
      event = event.to_unsafe_h if event.respond_to?(:to_unsafe_h)
      event.to_h.with_indifferent_access
    end
  end

  def page_events_available?
    defined?(PageEvent) && ActiveRecord::Base.connection.data_source_exists?("page_events")
  end
end
