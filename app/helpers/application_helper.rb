module ApplicationHelper
    def render_modal(title: "", body: "", footer: "")
        render(partial: '/partials/modal', locals: { title: title, body: body, footer: footer })
    end

    def site_favicon_tag
      if defined?(@site_setting) && @site_setting&.favicon&.attached?
        favicon = @site_setting.favicon
        favicon_link_tag url_for(favicon), rel: "icon", type: favicon.content_type, sizes: "any"
      else
        favicon_link_tag asset_path("favicon.png"), rel: "icon", type: "image/png"
      end
    end
end
