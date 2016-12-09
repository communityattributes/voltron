module Voltron
  module ActionController

    extend ActiveSupport::Concern

    included do
      after_action :include_flash
    end

    def flash!(**flashes)
      @_flashes ||= {}

      flashes.symbolize_keys.each do |type, messages|
        @_flashes[type] ||= []
        @_flashes[type] += Array.wrap(messages)
      end
    end

    private

      def include_flash
        return if !request.xhr? || !Voltron.config.flash.enabled
        response.headers[Voltron.config.flash.header] = @_flashes.to_json
      end

  end
end