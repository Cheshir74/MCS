class PagesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_page, only: :show

  def show
    @pages = Page.all
  end

  def index
    @pages = Page.all
  end

  private
  def set_page
    @page = Page.find(params[:id])
  end

end
