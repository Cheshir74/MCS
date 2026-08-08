class Admin::GalleriesController < Admin::AdminController
  before_action :set_gallery, :only => [ :edit, :update, :destroy, :sort, :delete_image_attachment, :destroy_attach ]

  def new
    @gallery = Gallery.new
    @galleries = Gallery.all
  end

  def index
    @galleries = Gallery.with_attached_images.order(updated_at: :desc)
  end

  def edit
    @galleries = Gallery.all
  end

  def update
    if params[:delete_selected].present?
      selected_image_ids = Array(params[:delete_img_ids]).reject(&:blank?)

      if selected_image_ids.blank?
        return redirect_back(fallback_location: edit_admin_gallery_path(@gallery), alert: "No photos selected")
      end

      attachments = @gallery.images.attachments.where(id: selected_image_ids)

      if attachments.exists?
        attachments.find_each(&:purge)
        flash[:notice] = "Selected photos deleted"
      else
        flash[:alert] = "Selected photos were not found"
      end

      return redirect_back(fallback_location: edit_admin_gallery_path(@gallery))
    end

    if @gallery.update(gallery_params)
      if params[:gallery][:images].present?
        params[:gallery][:images].each do |image|
          @gallery.images.attach(image)
        end
      end
      flash[:notice] = "Gallery updated"
      redirect_to edit_admin_gallery_path(params[:id])
    else
      @galleries = Gallery.all
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

  def bulk_update
    gallery_ids = selected_gallery_ids
    return redirect_to(admin_galleries_path, alert: "Select at least one gallery.") if gallery_ids.empty?

    galleries = Gallery.where(id: gallery_ids)

    case params[:bulk_operation]
    when "set_visibility"
      visible_state = params[:visibility_state].to_s
      return redirect_to(admin_galleries_path, alert: "Choose a visibility state first.") if visible_state.blank?

      visible_value =
        case visible_state
        when "visible"
          true
        when "hidden"
          false
        else
          nil
        end

      return redirect_to(admin_galleries_path, alert: "Choose a valid visibility state.") if visible_value.nil?

      updated_count = update_gallery_visibility(galleries, visible_value)
      notice_message =
        if visible_value
          "Made #{updated_count} galler#{updated_count == 1 ? 'y' : 'ies'} visible."
        else
          "Hidden #{updated_count} galler#{updated_count == 1 ? 'y' : 'ies'}."
        end

      redirect_to admin_galleries_path, notice: notice_message
    when "delete"
      deleted_count = 0
      failures = []

      galleries.find_each do |gallery|
        if gallery.destroy
          deleted_count += 1
        else
          failures.concat(gallery.errors.full_messages)
        end
      end

      flash_options = {}
      flash_options[:notice] = "Deleted #{deleted_count} galler#{deleted_count == 1 ? 'y' : 'ies'}." if deleted_count.positive?
      flash_options[:alert] = failures.uniq.to_sentence if failures.any?
      redirect_to admin_galleries_path, flash_options.presence || { alert: "No galleries were deleted." }
    else
      redirect_to admin_galleries_path, alert: "Choose a bulk action first."
    end
  end

  def delete_image_attachment
    attachment_id = params[:image_id] || params[:format]
    if attachment_id.present?
      attachment = @gallery.images.find(attachment_id)
      attachment.purge
      flash[:notice] = "Image removed"
    else
      flash[:alert] = "Image not found"
    end
    redirect_back(fallback_location: edit_admin_gallery_path(@gallery))
  end

  def destroy_attach
    selected_image_ids = Array(params[:delete_img_ids]).reject(&:blank?)

    if selected_image_ids.blank?
      return redirect_back(fallback_location: edit_admin_gallery_path(@gallery), alert: "No photos selected")
    end

    attachments = @gallery.images.attachments.where(id: selected_image_ids)

    if attachments.exists?
      attachments.find_each(&:purge)
      flash[:notice] = "Selected photos deleted"
    else
      flash[:alert] = "Selected photos were not found"
    end

    redirect_back(fallback_location: edit_admin_gallery_path(@gallery))
  end
  
  def sort 
    return head :bad_request unless params[:images]

    @gallery.images.attachments.where(id: params[:images]).index_by(&:id).then do |attachments|
      params[:images].each_with_index do |id, position|
        attachments[id.to_i]&.update_column(:position, position + 1)
      end
    end

    head :ok
  end


  private

  def set_gallery
    @gallery = Gallery.find(params[:id])
  end

  def gallery_params
    params.require(:gallery).permit(:name, :visible, *Gallery::HOMEPAGE_FIELDS)
  end

  def selected_gallery_ids
    Array(params[:gallery_ids]).reject(&:blank?).map(&:to_i).uniq
  end

  def update_gallery_visibility(galleries, visible)
    updated_count = 0

    galleries.find_each do |gallery|
      updated_count += 1 if gallery.update(visible: visible)
    end

    updated_count
  end
end
