Voltron.setup do |config|

  # === Voltron Base Configuration ===

  # Whether to enable debug output in the browser console and terminal window
  config.debug = true

  # The base url of the site. Used by various voltron-* gems to correctly build urls
  # Defaults to Rails.application.config.action_controller.default_url_options[:host], or 'localhost:3000' if not set
  # config.base_url = 'www.google.com'

  # What logger calls to Voltron.log should use
  # config.logger = Logger.new(Rails.root.join('log', 'voltron.log'))

  # Set the log level for JS output in the browser console.
  # Available log levels are: :debug, :info, :warn, :error, :fatal, and :unknown,
  # or each log levels corresponding number, ranging from 0 through 5 respectively.
  # For consistency the available log levels match possible options for rails' +log_level+,
  # but due to limited output options available in the browser console,
  # "error", "fatal", and "unknown" all behave the same way.
  config.log_level = :debug

end
