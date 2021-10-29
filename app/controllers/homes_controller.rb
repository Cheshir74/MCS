class HomesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:index]

  def show
  end

  def index
    @home = Home.find_by(visible: true)
  end

end
