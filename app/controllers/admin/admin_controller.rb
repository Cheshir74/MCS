class Admin::AdminController < ApplicationController
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to home_path, :alert => exception.message
  end
  authorize_resource
  layout "admin"

  before_action :load_admin_shell_context
  before_action :set_site_setting, only: [:show, :edit, :update]
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
    @dashboard_stats = {
      homes: {
        value: @admin_counts[:homes],
        note: "#{@admin_counts[:published_homes]} published",
        tone: @admin_counts[:published_homes].positive? ? "success" : "warning"
      },
      galleries: {
        value: @admin_counts[:galleries],
        note: "#{@admin_counts[:visible_galleries]} visible",
        tone: @admin_counts[:visible_galleries].positive? ? "accent" : "warning"
      },
      pages: {
        value: @admin_counts[:pages],
        note: "#{@admin_counts[:pages].positive? ? 'content pages ready' : 'empty library'}",
        tone: @admin_counts[:pages].positive? ? "accent" : "muted"
      },
      team: {
        value: @admin_counts[:users],
        note: @admin_counts[:users].positive? ? "member account#{'s' unless @admin_counts[:users] == 1}" : "no admin accounts",
        tone: @admin_counts[:users].positive? ? "muted" : "warning"
      }
    }
    @dashboard_recent_homes = Home.order(updated_at: :desc).limit(3)
    @dashboard_recent_galleries = Gallery.order(updated_at: :desc).limit(3)
    @dashboard_recent_pages = Page.order(updated_at: :desc).limit(3)
    @dashboard_recent_users = User.order(updated_at: :desc).limit(3)
  end

  def show
    @site_setting = SiteSetting.first || SiteSetting.create!
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

end
