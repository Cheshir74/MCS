class Admin::AdminController < ApplicationController
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to home_path, :alert => exception.message
  end
  authorize_resource
  layout "admin"

  before_action :set_site_setting, only: [:show, :edit, :update]
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
    params.require(:site_setting).permit(:site_name, :favicon, :facebook_link, :instagram_link)
  end

end