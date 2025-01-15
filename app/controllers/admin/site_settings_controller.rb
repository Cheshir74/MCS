class Admin::SiteSettingsController < ApplicationController
  before_action :set_site_setting, only: [:show, :edit, :update]

  # GET /site_settings/:id/edit
  def edit
  end

  def show
  end

  # PATCH/PUT /site_settings/:id
  def update
    if @site_setting.update(site_setting_params)
      redirect_to admin_path, notice: 'Настройки были успешно обновлены.'
    else
      render :edit
    end
  end

  private
    def set_site_setting
      @site_setting = SiteSetting.first || SiteSetting.create!
    end

    def site_setting_params
      params.require(:site_setting).permit(:name_site, :fb_url, :inst_url, :vk_url, :yn_verification_pri, :yn_verification_sec, :email_contact, :email_login, :email_domain, :email_password, :email_address, :email_port, :email_tls, :email_ssl)
    end
end