module Voltron
  class Engine < Rails::Engine

    config.autoload_paths += Dir["#{config.root}/lib/**/"]

    initializer "voltron.initialize" do
      ::ActionView::Base.send :include, ::Voltron::ViewHelper
      ::ActionController::Base.send :include, ::Voltron::ActionController
    end

  end
end
