require 'rails_helper'
RSpec.describe ArticlesController, type: :controller do

  let(:article) { create(:article) }

  describe 'GET #index' do
    let(:articles) { create_list(:article, 2) }

    before { get :index }

    it 'populates an array of all articles' do
      expect(assigns(:articles)).to match_array(articles)
    end

    it 'renders index view' do
      expect(response).to render_template :index
    end

  end

  describe 'GET #new' do
    before { get :new }

    it 'assigns a new Article to @article' do
      expect(assigns(:article)).to be_a_new(Article)
    end

    it 'renders new view' do
      expect(response).to render_template :new
    end

  end

  describe 'GET #show' do
    before { get :show, params: { id: article } }

    it 'assings the requested question to @article' do
      expect(assigns(:article)).to eq article
    end

    it 'renders show view' do
      expect(response).to render_template :show
    end


  end

  describe 'POST #create' do
    let(:request) { post :create, params: { article: attributes_for(:article) } }

    it 'saves the new question in the DB' do
      expect { request }.to change(Article, :count).by(1)
    end

    it 'redirects to show view' do
      request
      expect(response).to redirect_to assigns(:article)
    end
  end

end