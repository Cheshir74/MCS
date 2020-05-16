class ArticlesController < ApplicationController
  #load_and_authorize_resource

  skip_before_action :authenticate_user!, :only => [:index]

  def index
    @articles = Article.all
  end

  def new
    @article = Article.new
  end

  def show
    @article = Article.find(params[:id])
  end

  def edit
    @article = Article.find(params[:id])
  end

  def update
    @article = Article.find(params[:id])

    if(@article.update(post_params))
      redirect_to @article
    else
      render 'edit'
    end
  end

  def destroy
    @article = Article.find(params[:id])

    @article.destroy
    redirect_to articles_path
  end

  def create
    #render plain: params[:article].inspect
    @article = Article.new(post_params)
    if(@article.save)
      redirect_to @article
    else
      render :new
    end

  end

  private def post_params
    params.require(:article).permit(:title, :body)
  end
end
