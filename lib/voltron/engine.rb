module Voltron
  class Engine < Rails::Engine

    config.autoload_paths += Dir["#{config.root}/lib/**/"]

    initializer "voltron.initialize" do
      ::ActionController::Base.send :include, ::Voltron::FlashHelper
    end

  end
end
