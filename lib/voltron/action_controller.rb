module Voltron
  module ActionController

    after_action :include_flash

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