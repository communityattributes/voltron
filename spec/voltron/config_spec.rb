require "rails_helper"

describe Voltron::Config do

  let(:config) { Voltron::Config.new }

  it "should have a js config section" do
    expect(config.js).to be_a(Voltron::Config::Js)
  end

  it "can merge in additional config" do
    config.merge({ dummy: "data" })
    expect(config.to_h).to have_key(:dummy)
    expect(config.to_h[:dummy]).to eq("data")
  end

end
