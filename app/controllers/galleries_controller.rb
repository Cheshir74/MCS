class GalleriesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_gallery, only: :show

  def show
  end

  private
  def set_gallery
    @gallery = Gallery.find_by(id: params[:id],visible: true)
  end

end
