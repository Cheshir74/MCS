class HomesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:index]

  def index
    @image_main = Home.first.image

  end

  def show
  end
end
