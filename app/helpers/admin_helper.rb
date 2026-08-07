module AdminHelper
  def admin_home_variant_label(value)
    variant = value.respond_to?(:design_variant) ? value.design_variant : value
    variant.to_s == "editorial" ? "New" : "Legacy"
  end

  def admin_home_variant_mode_label(value)
    "#{admin_home_variant_label(value)} mode"
  end

  def admin_sidebar_icon(name)
    svg = case name
          when :dashboard
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>
              </svg>
            SVG
          when :home
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11.5 12 4l9 7.5"/>
                <path d="M5 10v8a2 2 0 0 0 2 2h3v-5h4v5h3a2 2 0 0 0 2-2v-8"/>
              </svg>
            SVG
          when :users
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 11Z"/>
                <path d="M5 20a6.8 6.8 0 0 1 14 0"/>
                <path d="M18.5 8.5h1.5"/>
                <path d="M19.25 7.75v1.5"/>
              </svg>
            SVG
          when :galleries
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3"/>
                <path d="m7.5 14 2.5-2.5L13 14l2-2 3.5 3.5"/>
                <circle cx="8" cy="8" r="1.6"/>
              </svg>
            SVG
          when :pages
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 4.5h7l4 4V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"/>
                <path d="M14 4.5V9h4"/>
                <path d="M9 13h6"/>
                <path d="M9 16.5h6"/>
              </svg>
            SVG
          else
            ""
          end

    svg.html_safe
  end

  def admin_user_roles(user)
    roles = []
    roles << "Superadmin" if user.superadmin_role?
    roles << "Editor" if user.supervisor_role?
    roles << "Viewer" if user.user_role? || roles.empty?
    roles
  end
end
