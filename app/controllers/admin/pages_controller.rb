class Admin::PagesController < Admin::AdminController
  before_action :set_page, :only => [ :edit, :update, :destroy ]

  def new
    @page = Page.new
    @pages = Page.all
  end

  def index
    @pages = Page.all
  end

  def edit
    @pages = Page.all
  end

  def update

  end

  def create
    @page = Page.new(page_params)
    if @page.save
      flash[:notice] = "Page Created"
      redirect_to admin_pages_path
    else
      @pages = Page.all
      render 'new'
    end

  end

  def destroy
    @page.destroy
    redirect_to admin_pages_path
  end

  private

  def set_page
    @page = Page.find(params[:id])
  end

  def page_params
    params.require(:page).permit(:title, :body)
  end

end
