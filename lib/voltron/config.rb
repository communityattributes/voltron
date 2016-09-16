require "logger"

module Voltron
	class Config

		autoload :Js, "voltron/config/js"

		attr_accessor :logger, :packages, :debug

		attr_accessor :base_url

		def initialize
			@logger = ::Logger.new(::Rails.root.join("log", "voltron.log"))
			@debug ||= false
			@packages ||= []
		end

		def js
			@js ||= Js.new
		end

		def to_json
			{ stylesheet: ActionController::Base.helpers.asset_path("tinymce.css") }
				.merge(js.to_h) # allows overriding the stylesheet param if set
				.merge(packages: @packages, debug: @debug) # ensure these two params are always set here
				.to_json.html_safe
		end
	end
end
