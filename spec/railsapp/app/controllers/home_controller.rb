class HomeController < ApplicationController

  def index
    headers["Cache-Control"]  = "no-cache"
    headers.delete "Last-Modified"
    headers.delete "ETag"
  end

end