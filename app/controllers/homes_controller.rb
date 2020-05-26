class HomesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:index]

  def index
    if Home.first.present?
      @image_main = Home.first.image
    end

  end

  def show
  end
end
