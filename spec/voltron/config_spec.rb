require "rails_helper"

describe Voltron::Config do

  let(:config) { Voltron::Config.new }

  it "should have a js config section" do
    expect(config.js).to be_a(Voltron::Config::Js)
  end

end
