class ImagesController < ApplicationController

  def new
    @image = Image.new
  end

  def create
    @image = Image.new(image_params)
    if @image.save
      flash[:notice] = "image Created"
      redirect_to home_path
    else
      render 'new'
    end
  end

  def destroy
    @image = Image.find(params[:id])
    @image.destroy

    flash[:notice] = "Image Removed"

    redirect_to images_path
  end
  def index
    @images = Image.all
    @galleries = Gallery.all
  end
  private
  def image_params
    params.require(:image).permit(:image, :gallery_id, :image_title, :image_description, :image_file_size, :image_content_type)
  end
end
