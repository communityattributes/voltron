require "rails_helper"

describe Voltron do
	it "has a version number" do
		expect(Voltron::VERSION).not_to be nil
	end

	it "can be configured" do
		expect(Voltron.config.base_url).to be_blank

		Voltron.setup do |config|
			config.base_url = "http://www.example.com/"
		end

		expect(Voltron.config.base_url).to eq("http://www.example.com/")
	end

	it "should have defined package" do
		Voltron.setup do |config|
			config.debug = true
			config.packages << "test"
		end

		expect(Voltron.has_package?("test")).to eq(true)
	end

	it "should have an asset class accessible via .asset" do
		expect(Voltron.asset).to be_a(Voltron::Asset)
	end

	it "should have an config class accessible via .config" do
		expect(Voltron.config).to be_a(Voltron::Config)
	end

	it "should log to the defined logger" do
		expect(Voltron.config.logger).to receive(:info).with("[Voltron] [Tag] Test 1")
		Voltron.log "Test 1", "Tag"
	end
end
