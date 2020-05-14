class ArticlesController < ApplicationController
  def index
    @articles = Article.all
  end

  def new
    @article = Article.new
  end

  def show
    @article = Article.find(params[:id])
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
