class GalleriesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_gallery, only: :show

  def show
    @galleries = Gallery.all
  end

  private
  def set_gallery
    @gallery = Gallery.find(params[:id])
  end

end
