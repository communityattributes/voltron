module Voltron
  module Generators
    class InstallGenerator < Rails::Generators::Base

      source_root File.expand_path("../../../../spec/railsapp/config/initializers", __FILE__)

      desc "Add Voltron initializer"

      def copy_initializer
        copy_file "voltron.rb", Rails.root.join("config", "initializers", "voltron.rb")
      end

    end
  end
end