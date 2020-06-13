class GalleriesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:show]

  def new
    @gallery = Gallery.new
  end
  def show
    @gallery = Gallery.find(params[:id])
    @galleries = Gallery.all
   # @images = @gallery.images
  end

  def edit
    @gallery = Gallery.find(params[:id])
    @galleries = Gallery.all
   # @images = @gallery.images
  end

  def update
    @gallery = Gallery.find(params[:id])

    if params[:gallery][:images].present?
      params[:gallery][:images].each do |image|
        @gallery.images.attach(image)
      end
      flash[:notice] = "Gallery updated"
      redirect_to gallery_path(params[:id])
    else
      render 'edit'
    end
  end

  def create
    @gallery = Gallery.new(gallery_params)
    if @gallery.save
      flash[:notice] = "Gallery Created"
      redirect_to home_path
    else
      render 'new'
    end
  end
  private
  def gallery_params
    params.require(:gallery).permit(:name)
  end
end
