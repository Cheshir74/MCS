class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :authenticate_user!
  before_action :getGalleryNav

  def after_sign_in_path_for(resource)
    home_path
  end

  private
  def getGalleryNav
    @galleryNav = Gallery.where(visible: true)
  end
  end
