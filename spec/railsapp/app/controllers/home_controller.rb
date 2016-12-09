class HomeController < ApplicationController

  def index
    flash! notice: "Test"
    headers["Cache-Control"]  = "no-cache"
    headers.delete "Last-Modified"
    headers.delete "ETag"
  end

end