class HomesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index]
  before_action :turbo_frame_request_variant

  def turbo_frame_request_variant
    request.variant = :turbo_frame if turbo_frame_request?
  end

  def show
  end

  def index
    @home = Home
      .with_attached_image
      .with_attached_images
      .includes(
        :editorial_lead_gallery,
        :editorial_feature_gallery,
        :editorial_compact_left_gallery,
        :editorial_compact_right_gallery,
        :editorial_series_first_gallery,
        :editorial_series_second_gallery,
        :editorial_series_third_gallery
      )
      .find_by(visible: true)
  end
end
