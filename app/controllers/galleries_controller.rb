class GalleriesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_gallery, only: :show

 def show
  @gallery = Gallery.find_by(id: params[:id])
  
  respond_to do |format|
    format.html do
      if @gallery.nil?
        redirect_to galleries_path, alert: 'Галерея не найдена'
      end
    end
    
    format.json do
      if @gallery.nil?
        render json: { error: 'Gallery not found' }, status: :not_found
      else
        render :show
      end
    end
  end
end

  private
  def set_gallery
    @gallery = Gallery.find_by(id: params[:id])
  end

end
