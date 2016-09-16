require "rails_helper"

describe Voltron::Config::Js do

	let(:js) { Voltron::Config::Js.new }

	it "should apply all missing method calls as a key/value pair of data" do
		expect(js.to_h).to be_empty

		js.random_value = "Test"

		expect(js.to_h).to_not be_empty
	end
end
