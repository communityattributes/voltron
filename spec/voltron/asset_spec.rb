require "rails_helper"

describe Voltron::Asset do

	let(:assets) { Voltron::Asset.new }

	it "can find all assets" do
		expect(assets.files).to be_a(Hash)
	end

	it "should return nil if file does not exist" do
		expect(assets.find("missing.png")).to be_nil
	end
end
