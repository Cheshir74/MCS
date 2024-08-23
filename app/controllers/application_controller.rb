class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :authenticate_user!
  before_action :getGalleryNav
  before_action :turbo_frame_request_variant


  def after_sign_in_path_for(resource)
    home_path
  end

  def render_modal(title: "", body: "", footer: "")
    render(partial: '/partials/modal', locals: { title: title, body: body, footer: footer })
  end

  def turbo_frame_request_variant
    request.variant = :turbo_frame if turbo_frame_request?
  end

  private
  def getGalleryNav
    @galleryNav = Gallery.where(visible: true)
  end
  

  end
