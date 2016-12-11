module Voltron
  class Engine < Rails::Engine

    isolate_namespace Voltron

    config.autoload_paths += Dir["#{config.root}/lib/**/"]

  end
end
