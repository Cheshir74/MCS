class HelloController < ApplicationController
  skip_before_action :authenticate_user!

  def world
  end
end
