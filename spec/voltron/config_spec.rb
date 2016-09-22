require "rails_helper"

describe Voltron::Config do

  let(:config) { Voltron::Config.new }

  it "should have a js config section" do
    expect(config.js).to be_a(Voltron::Config::Js)
  end

  it "should return a properly formatted json representation of the config data" do
    expect { JSON.parse(config.to_json) }.not_to raise_error
  end
end
