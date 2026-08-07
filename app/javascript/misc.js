(function($) {
  'use strict';

  const MINIMIZE_SELECTOR = '[data-toggle="minimize"]';
  const FULLSCREEN_SELECTOR = '#fullscreen-button';
  const SIDEBAR_STORAGE_KEY = 'admin:sidebar:state';
  const DESKTOP_SIDEBAR_QUERY = '(min-width: 1181px)';

  function initializeSidebar() {
    const body = $('body');
    const sidebar = $('.admin-sidebar');

    if (!sidebar.length) return;

    // reset sidebar event handlers to avoid duplicates after Turbo navigation
    sidebar.off('show.bs.collapse', '.collapse');
    $(document).off('click', MINIMIZE_SELECTOR);
    $(document).off('click', FULLSCREEN_SELECTOR);
    $(window).off('resize.adminSidebar');

    //Add active class to nav-link based on url dynamically
    //Active class can be hard coded directly in html file also as required
    function normalizePath(path) {
      return (path || '').replace(/\/+$/, '') || '/';
    }

    function addActiveClass(element) {
      const href = element.attr('href');
      if (!href) return;

      const linkPath = normalizePath(new URL(href, window.location.origin).pathname);
      if (linkPath === '/' ? current === '/' : current === linkPath || current.startsWith(linkPath + '/')) {
        element.closest('.admin-sidebar__item').addClass('is-active');
        element.addClass('is-active');
      }
    }

    sidebar.find('.admin-sidebar__item').removeClass('is-active');
    sidebar.find('.admin-sidebar__link').removeClass('is-active');
    sidebar.find('.collapse.show').removeClass('show');

    function sidebarStorageKey() {
      return body.data('admin-sidebar-storage-key') || SIDEBAR_STORAGE_KEY;
    }

    function desktopSidebarEnabled() {
      return window.matchMedia(DESKTOP_SIDEBAR_QUERY).matches;
    }

    function readSidebarState() {
      try {
        return window.localStorage.getItem(sidebarStorageKey());
      } catch (error) {
        return null;
      }
    }

    function writeSidebarState(collapsed) {
      try {
        window.localStorage.setItem(sidebarStorageKey(), collapsed ? 'collapsed' : 'expanded');
      } catch (error) {
      }
    }

    function syncSidebarToggle() {
      const collapsed = body.hasClass('sidebar-icon-only');
      const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

      $(MINIMIZE_SELECTOR)
        .attr('aria-pressed', String(collapsed))
        .attr('aria-expanded', String(!collapsed))
        .attr('aria-label', label)
        .attr('title', label);
    }

    function applyStoredSidebarState() {
      if (!desktopSidebarEnabled()) {
        body.removeClass('sidebar-icon-only');
        syncSidebarToggle();
        return;
      }

      body.toggleClass('sidebar-icon-only', readSidebarState() === 'collapsed');
      syncSidebarToggle();
    }

    var current = normalizePath(window.location.pathname);
    $('.admin-sidebar__link', sidebar).each(function() {
      var $this = $(this);
      addActiveClass($this);
    })

    $('.horizontal-menu .nav li a').each(function() {
      var $this = $(this);
      addActiveClass($this);
    })

    //Close other submenu in sidebar on opening any

    sidebar.on('show.bs.collapse', '.collapse', function() {
      sidebar.find('.collapse.show').collapse('hide');
    });

    applyStoredSidebarState();
    $(window).on('resize.adminSidebar', function() {
      applyStoredSidebarState();
    });

    // Initialize admin shell helpers
    applyStyles();

    function applyStyles() {
      //Applying perfect scrollbar
      if (!body.hasClass("rtl")) {
        if ($('.settings-panel .tab-content .tab-pane.scroll-wrapper').length) {
          const settingsPanelScroll = new PerfectScrollbar('.settings-panel .tab-content .tab-pane.scroll-wrapper');
        }
        if ($('.chats').length) {
          const chatsScroll = new PerfectScrollbar('.chats');
        }
        if (body.hasClass("sidebar-fixed")) {
          var fixedSidebarScroll = new PerfectScrollbar('#sidebar .admin-sidebar__nav');
        }
      }
    }

    $(document).on("click", MINIMIZE_SELECTOR, function() {
      if (!desktopSidebarEnabled()) return;

      const collapsed = !body.hasClass('sidebar-icon-only');
      body.toggleClass('sidebar-icon-only', collapsed);
      writeSidebarState(collapsed);
      syncSidebarToggle();
    });

    //checkbox and radios
    $(".form-check label,.form-radio label").each(function() {
      var $label = $(this);
      if ($label.find('.input-helper').length === 0) {
        $label.append('<i class="input-helper"></i>');
      }
    });

    //fullscreen
    $(document).on("click", FULLSCREEN_SELECTOR, function toggleFullScreen() {
      if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    })

  }

  document.addEventListener('turbo:load', initializeSidebar);
  document.addEventListener('DOMContentLoaded', initializeSidebar);

})(jQuery);
