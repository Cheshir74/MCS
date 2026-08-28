class WwwRedirect
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    canonical_host = canonical_host_for(request)

    if canonical_host && request.host == "www.#{canonical_host}"
      return redirect_response(request, canonical_host)
    end

    @app.call(env)
  end

  private

  def canonical_host_for(request)
    host = ENV["CANONICAL_HOST"].presence || ENV["PRODUCTION_APP_HOST"].presence
    host = URI.parse(host).host if host&.match?(%r{\Ahttps?://}i)
    host = host&.delete_suffix(".")&.downcase
    return if host.blank? || host.start_with?("www.") || host == request.host

    host
  rescue URI::InvalidURIError
    nil
  end

  def redirect_response(request, canonical_host)
    location = request.url.sub(%r{://www\.#{Regexp.escape(canonical_host)}(?=[:/]|$)}i, "://#{canonical_host}")

    [301, { "Location" => location, "Content-Type" => "text/html" }, []]
  end
end
