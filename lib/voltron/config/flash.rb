module Voltron
  class Config

    def flash
      @flash ||= Flash.new
    end

    class Flash

      attr_accessor :enabled, :header

      def initialize
        @enabled ||= true
        @header ||= "X-Flash"
      end
    end

  end
end