require 'rails_helper'
RSpec.describe ArticlesController, type: :controller do

  let(:article) { create(:article) }

  describe 'GET #edit' do

  end

  describe 'PATCH #update' do
    it 'Article edit' do

    end

  end

  describe 'GET #destroy' do

  end

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
    let(:http_request) { post :create, params: { article: attributes_for(:article) } }
    let(:invalid_params) { post :create, params: { article: attributes_for(:invalid_article) } }

    context 'with valid attributes' do
      it 'saves the new question in the DB' do
        expect { http_request }.to change(Article, :count).by(1)
      end

      it 'redirects to show view' do
        expect(http_request).to redirect_to(assigns(:article))
      end
    end

    context 'with invalid attributes' do
      it 'does not save the question in the DB' do
        expect { invalid_params }.to_not change(Article, :count)
      end

      it 're-renders new view' do
        invalid_params
        expect(response).to render_template(:new)
      end
    end
  end


end