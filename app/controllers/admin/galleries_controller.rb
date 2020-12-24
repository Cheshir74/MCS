class Admin::GalleriesController < Admin::AdminController
  before_action :set_gallery, :only => [ :edit, :update, :destroy, :sort, :delete_image_attachment ]

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

  def delete_image_attachment
    attachment = @gallery.images.find(params[:format])
    attachment.purge
    redirect_back(fallback_location: edit_admin_gallery_path)
  end

  def destroy_attach
    attachments = ActiveStorage::Attachment.where(id: params[:delete_img_ids])
    attachments.map(&:purge)
    redirect_back(fallback_location: edit_admin_gallery_path)
  end
  
  def sort 
    params[:span].each_with_index do |id, position|
      @gallery.where(id: id).update_all(position: position + 1)
   end
   respond_to do |format|
       format.js
   end
  end


  private

  def set_gallery
    @gallery = Gallery.find(params[:id])
  end

  def gallery_params
    params.require(:gallery).permit(:name)
  end
end
