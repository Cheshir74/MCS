class Admin::HomesController < Admin::AdminController
  before_action :set_home, :only => [ :edit, :update, :destroy, :delete_image_attachment, :sort ]

  def index
    @homes = Home.all
  end

  def update
    if @home.update(home_params)
      if params[:home][:images].present?
        params[:home][:images].each do |image|
          @home.images.attach(image)
        end
      end
      flash[:notice] = "Home updated"
      redirect_to edit_admin_home_path(params[:id])
    else
      render 'edit'
    end
  end

  def create
    @home = Home.new(home_params)
    if @home.save
      flash[:notice] = "Home Created"
      redirect_to admin_homes_path
    else
      @homes = Home.all
      render 'new'
    end
  end

  def edit
    @homes = Home.all
    @galleries = Gallery.all
  end

  def new
    @home = Home.new
    @homes = Home.all
    @galleries = Gallery.all
  end

  def delete_image_attachment
    attachment = @home.images.find(params[:format])
    attachment.purge
    redirect_back(fallback_location: edit_admin_home_path)
  end

  def destroy_attach
    attachments = ActiveStorage::Attachment.where(id: params[:delete_img_ids])
    attachments.map(&:purge)
    redirect_back(fallback_location: edit_admin_home_path)
  end

  def destroy
    @home.destroy
    redirect_to admin_homes_path
  end

  def sort 
    params[:images].each_with_index do |id, position|
      ActiveStorage::Attachment.where(id: id).update_all(position: position + 1)
      
   end
   respond_to do |format|
       format.js
   end
  end

  private

  def set_home
    @home = Home.find(params[:id])
  end

  

  def home_params
    params.require(:home).permit(:title,:body,:title_block1,:body_block1,:gallery_id,:visible)
  end
end
