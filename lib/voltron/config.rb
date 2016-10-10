require "logger"
require "voltron/config/js"

module Voltron
  class Config

    attr_accessor :logger, :debug, :base_url

    def initialize
      @logger = ::Logger.new(::Rails.root.join("log", "voltron.log"))
      @debug ||= false
      @base_url ||= "http://localhost:3000"
    end

    def to_h
      js.to_h.merge(debug: @debug)
    end
  end
end
