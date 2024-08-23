class HomesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:index]
  before_action :turbo_frame_request_variant

def turbo_frame_request_variant
  request.variant = :turbo_frame if turbo_frame_request?
end

  def show
  end

  def index
    @home = Home.find_by(visible: true)
  end

end
