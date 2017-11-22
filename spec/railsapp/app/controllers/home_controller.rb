class HomeController < ApplicationController

  def index
    Voltron.config.js.validation = {
      blacklist: ['password']
    }
  end

end