class Admin::HomesController < Admin::AdminController
  before_action :set_home, :only => [ :edit, :update, :destroy ]


  def index
    @homes = Home.all
  end

  def update
    if @home.update_attributes(home_params)
      if params[:home][:images].present?
        params[:home][:images].each do |image|
          @home.images.attach(image)
        end
      end
      flash[:notice] = "Gallery updated"
      redirect_to edit_admin_home_path(params[:id])
    else
      render 'edit'
    end
  end

  def edit
    @homes = Home.all
  end

  def new
    @home = Home.new
    @homes = Home.all
  end


  def destroy
    @home.destroy
    redirect_to admin_homes_path
  end

  private
  def set_home
    @home = Home.find(params[:id])
  end

  def home_params
    params.require(:home).permit(:title,:body)
  end
end
