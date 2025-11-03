module AdminHelper
  def admin_sidebar_icon(name)
    svg = case name
          when :dashboard
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>
              </svg>
            SVG
          when :home
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11.5 12 4l9 7.5"/>
                <path d="M5 10v8a2 2 0 0 0 2 2h3v-5h4v5h3a2 2 0 0 0 2-2v-8"/>
                <path d="M9.5 7.5h5"/>
              </svg>
            SVG
          when :users
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 9a3 3 0 1 0 3-3M5 21v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1"/>
                <path d="M16 11a3 3 0 1 0 3-3"/>
                <path d="M19 21v-1a4 4 0 0 0-3-3.87"/>
              </svg>
            SVG
          when :galleries
            <<~SVG
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3"/>
                <path d="m7.5 14 2.5-2.5L13 14l2-2 3.5 3.5"/>
                <circle cx="8" cy="8" r="1.6"/>
              </svg>
            SVG
          else
            ""
          end

    svg.html_safe
  end
end
