class ImagesController < ApplicationController

  def new
    @image = Image.new
  end

  def create
    files = Array(params[:image][:image]) # может быть один файл или массив
    gallery_id = image_params[:gallery_id]
    created_count = 0

    files.each do |file|
      next if file.blank?
      @image = Image.new(
        image: file,
        gallery_id: gallery_id,
        image_title: image_params[:image_title],
        image_description: image_params[:image_description]
      )
      if @image.save
        ProcessImageVariantsJob.perform_later(@image.image.blob)
        created_count += 1
      end
    end

    if created_count > 0
      flash[:notice] = "#{created_count} image(s) uploaded"
      redirect_to images_path
    else
      @image = Image.new(image_params.except(:image))
      flash.now[:alert] = "No images were uploaded"
      render :new
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
    params.require(:image).permit(:gallery_id, :image_title, :image_description)
  end
end
