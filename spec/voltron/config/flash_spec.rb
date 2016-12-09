require "rails_helper"

describe Voltron::Config::Flash do

  let(:flash) { Voltron::Config::Flash.new }

  it "should have a default header of X-Flash" do
    expect(flash.header).to eq("X-Flash")
  end

  it "should return an instance of the flash config" do
    expect(Voltron.config.flash).to be_a(Voltron::Config::Flash)
  end
end
