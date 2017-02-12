require "logger"
require "voltron/config/js"

module Voltron
  class Config

    include ::ActiveSupport::Callbacks

    define_callbacks :generate_voltron_config

    attr_accessor :logger, :debug, :base_url

    def initialize
      @logger = ::Logger.new(::Rails.root.join("log", "voltron.log"))
      @debug ||= false
      @base_url ||= (Rails.application.config.action_controller.default_url_options.try(:[], :host) || "http://localhost:3000")
    end

    def to_h
      run_callbacks :generate_voltron_config
      js.to_h.merge(debug: @debug)
    end

    def merge(data)
      js.custom.merge! data
    end

  end
end
