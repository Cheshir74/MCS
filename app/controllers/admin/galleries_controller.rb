class Admin::GalleriesController < ApplicationController
  before_action :set_gallery, :only => [ :edit, :update, :destroy ]

  def new
    @gallery = Gallery.new
    @galleries = Gallery.all
  end

  def index
    @galleries = Gallery.all
  end

  def edit
    @galleries = Gallery.all
  end

  def update
    if @gallery.update_attributes(gallery_params)
      if params[:gallery][:images].present?
        params[:gallery][:images].each do |image|
          @gallery.images.attach(image)
        end
      end
      flash[:notice] = "Gallery updated"
      redirect_to edit_admin_gallery_path(params[:id])
    else
      render 'edit'
    end
  end

  def create
    @gallery = Gallery.new(gallery_params)
    if @gallery.save
      flash[:notice] = "Gallery Created"
      redirect_to admin_galleries_path
    else
      @galleries = Gallery.all
      render 'new'
    end

  end

  def destroy
    @gallery.destroy
    redirect_to admin_galleries_path
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:id])
  end

  def gallery_params
    params.require(:gallery).permit(:name)
  end
end
