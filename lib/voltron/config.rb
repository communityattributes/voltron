require "logger"
require "voltron/config/js"

module Voltron
  class Config

    attr_accessor :logger, :packages, :debug, :base_url

    def initialize
      @logger = ::Logger.new(::Rails.root.join("log", "voltron.log"))
      @debug ||= false
      @packages ||= []
      @base_url ||= "http://localhost:3000"
    end

    def to_json
      js.to_h
        .merge(packages: @packages, debug: @debug) # ensure these two params are always set here
        .to_json.html_safe
    end
  end
end
