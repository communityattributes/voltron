require "rails_helper"

describe ActionView::Base, type: :helper do

  include VoltronHelper

  def form_authenticity_token; "123"; end

  it "can generate a javascript include tag" do
    expect(voltron_include_tag).to_not be_blank
  end

  it "can create json config" do
    Voltron.config.debug = true
    expect(voltron_config_json).to eq("{\"debug\":true,\"controller\":\"test\",\"action\":null,\"auth_token\":\"123\"}")

    Voltron.config.js.custom_var = "test"
    expect(voltron_config_json).to eq("{\"custom_var\":\"test\",\"debug\":true,\"controller\":\"test\",\"action\":null,\"auth_token\":\"123\"}")
  end

end
