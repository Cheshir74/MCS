class Admin::HomesController < Admin::AdminController
  before_action :set_home, only: [:edit, :update, :destroy, :delete_image_attachment, :delete_photo_attachment, :sort]
  before_action :load_resources, only: [:edit, :new]

  def index
    @homes = Home.with_attached_image.with_attached_images.order(updated_at: :desc)
  end

  def update
    selected_image_ids = Array(params[:delete_img_ids]).reject(&:blank?)

    attachments_scope = ActiveStorage::Attachment.where(
      id: selected_image_ids,
      record_type: 'Home',
      record_id: @home.id,
      name: 'images'
    )

    if params[:delete_selected].present?
      if attachments_scope.exists?
        attachments_scope.find_each(&:purge)
        flash[:notice] = "Selected images deleted successfully"
      else
        flash[:alert] = "No images selected"
      end
      return redirect_back(fallback_location: edit_admin_home_path(@home))
    end

    attachments_scope.find_each(&:purge) if attachments_scope.exists?

    permitted_params = home_params
    params_without_images = permitted_params.except(:images, :editorial_hero_image)

    if @home.update(params_without_images)
      persist_home_media!(@home, permitted_params)

      flash[:notice] = "Домашняя страница обновлена"
      redirect_back(fallback_location: edit_admin_home_path(@home))
    else
      load_resources
      render :edit
    end
  end

  def set_primary
    home_id = params[:home_id].presence
    unless home_id
      return redirect_to admin_root_path, alert: "Select a home page to feature."
    end

    home = Home.find_by(id: home_id)

    unless home
      return redirect_to admin_root_path, alert: "The selected home page could not be found."
    end

    if home.visible?
      return redirect_to admin_dashboard_path, notice: "This home page is already featured."
    end

    begin
      ActiveRecord::Base.transaction do
        Home.where.not(id: home.id).update_all(visible: false)
        home.update!(visible: true)
      end
      flash[:notice] = "Featured home page updated."
    rescue ActiveRecord::RecordInvalid => e
      flash[:alert] = e.record.errors.full_messages.to_sentence.presence || "Unable to update featured home page."
    rescue => e
      Rails.logger.error("[Admin::HomesController#set_primary] #{e.class}: #{e.message}")
      flash[:alert] = "Unable to update featured home page."
    end
    redirect_to admin_dashboard_path
  end

  def create
    permitted_params = home_params
    @home = Home.new(permitted_params.except(:images, :editorial_hero_image))

    if @home.save
      persist_home_media!(@home, permitted_params)
      flash[:notice] = "Home Created"
      redirect_to admin_homes_path
    else
      load_resources
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
    if @home.image.attached?
      @home.image.purge
      redirect_back(fallback_location: edit_admin_home_path(@home), notice: "Изображение удалено")
    else
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

    @home.images.attachments.where(id: params[:images]).index_by(&:id).then do |attachments|
      params[:images].each_with_index do |id, position|
        attachments[id.to_i]&.update_column(:position, position + 1)
      end
    end

    head :ok
  end

  private

  def set_home
    @home = Home.find(params[:id])
  end

  def load_resources
    @homes = Home.all
    @galleries = Gallery.order(:name)
  end

  def attach_images
    params[:home][:images].each { |image| @home.images.attach(image) }
  end

  def persist_home_media!(home, permitted_params)
    enqueue_variant_processing(home.image.blob) if permitted_params[:image].present? && home.image.attached?
    attach_slider_images!(home, Array(permitted_params[:images]))
    attach_editorial_hero_image!(home, permitted_params[:editorial_hero_image])
  end

  def attach_slider_images!(home, uploads)
    uploads.reject(&:blank?).each do |image|
      home.images.attach(image)
      enqueue_variant_processing(home.images.attachments.last.blob)
    end
  end

  def attach_editorial_hero_image!(home, upload)
    return if upload.blank?

    existing_attachment_ids = home.images.attachments.ids
    home.images.attach(upload)

    fresh_attachment = home.images.attachments.where.not(id: existing_attachment_ids).order(created_at: :desc).first
    if fresh_attachment.present?
      enqueue_variant_processing(fresh_attachment.blob)
      promote_hero_attachment!(home, fresh_attachment)
    end
  end

  def enqueue_variant_processing(blob)
    ProcessImageVariantsJob.perform_later(blob)
  end

  def promote_hero_attachment!(home, attachment)
    ordered_attachments = home.ordered_images.reject { |item| item.id == attachment.id }

    ([attachment] + ordered_attachments).each_with_index do |item, index|
      ActiveStorage::Attachment.where(id: item.id).update_all(position: index + 1)
    end
  end

  def home_params
    params.require(:home).permit(
      :title,
      :body,
      :title_block1,
      :body_block1,
      :section_order,
      :gallery_id,
      :visible,
      :visible_cf,
      :design_variant,
      :editorial_hero_image,
      :image,
      *Home::EDITORIAL_GALLERY_FIELDS,
      *Home::EDITORIAL_FIELDS.excluding(
        :hero_primary_cta_label,
        :hero_secondary_cta_label,
        :scroll_cue_label,
        :reports_eyebrow,
        :reports_title,
        :about_eyebrow,
        :about_photo_caption,
        :contacts_location_label,
        :contacts_phone_label,
        :contacts_email_label,
        :contacts_social_label
      ),
      images: []
    )
  end

  def safe_return_path; end
end
