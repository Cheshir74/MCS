class Admin::HomesController < Admin::AdminController
  before_action :set_home, only: [:edit, :update, :destroy, :delete_image_attachment, :delete_photo_attachment, :sort]
  before_action :load_resources, only: [:edit, :new]  # Опционально, если @homes и @galleries нужны

  def index
    @homes = Home.all
  end

  def update
    # Сначала удаляем выбранные изображения
    if params[:delete_img_ids].present?
      ActiveStorage::Attachment.where(
        id: params[:delete_img_ids],
        record_type: 'Home',
        record_id: @home.id,
        name: 'images'
      ).destroy_all
    end
  
    # Получаем параметры без изображений
    params_without_images = home_params.except(:images)
    
    # Сначала обновляем параметры без изображений
    if @home.update(params_without_images)
      # Затем прикрепляем новые изображения, если они есть
      if home_params[:images].present?
        home_params[:images].each do |image|
          @home.images.attach(image)
        end
      end
      
      flash[:notice] = "Домашняя страница обновлена"
      redirect_to edit_admin_home_path(@home)
    else
      render :edit
    end
  end

  def create
    @home = Home.new(home_params)
    if @home.save
      flash[:notice] = "Home Created"
      redirect_to admin_homes_path
    else
      load_resources  # Или render :new без повторной загрузки
      render :new
    end
  end

  def edit
  
  end

  def new
    @home = Home.new
  end

  def delete_image_attachment
    @home.images.find(params[:image_id]).purge # Изменено с params[:format] на params[:image_id]
    redirect_back(fallback_location: edit_admin_home_path(@home))
  end

  def delete_photo_attachment
    begin
      # Находим и удаляем конкретное изображение
      attachment = @home.images.find(params[:image_id])
      attachment.purge
      
      # Редирект с сообщением
      redirect_back(fallback_location: edit_admin_home_path(@home), notice: "Изображение удалено")
    rescue ActiveRecord::RecordNotFound
      redirect_back(fallback_location: edit_admin_home_path(@home), alert: "Изображение не найдено")
    end
  end

  def destroy_attach
    if params[:delete_img_ids].blank?
      return redirect_back(fallback_location: edit_admin_home_path(@home), alert: "No images selected")
    end
  
    # Удаляем только выбранные вложения
    attachments = ActiveStorage::Attachment.where(
      record_type: 'Home',
      record_id: @home.id,
      name: 'images',
      id: params[:delete_img_ids]
    )
  
    attachments.each(&:purge) # Изменено с purge на each(&:purge)
  
    redirect_back(fallback_location: edit_admin_home_path(@home), notice: "Selected images deleted successfully")
  end

  def destroy
    @home.destroy
    redirect_to admin_homes_path
  end

  def sort
    return head :bad_request unless params[:images]

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

  def load_resources
    @homes = Home.all
    @galleries = Gallery.all
  end

  def attach_images
    params[:home][:images].each { |image| @home.images.attach(image) }
  end

  def home_params
    params.require(:home).permit(
      :title, :body, :title_block1, :body_block1,
      :gallery_id, :visible, :visible_cf, images: []
)
  end
end