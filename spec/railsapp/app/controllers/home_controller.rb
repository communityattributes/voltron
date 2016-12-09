class HomeController < ApplicationController

  def index
    flash! notice: "Hello"
    headers["Cache-Control"]  = "no-cache"
    headers.delete "Last-Modified"
    headers.delete "ETag"
  end

end