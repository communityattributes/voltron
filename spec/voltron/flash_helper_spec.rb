require "rails_helper"

class TestController < ActionController::Base
  def index
    flash! notice: "Test"
    head :ok
  end
end

describe TestController, type: :controller do

  let(:controller) { TestController.new }

  it "can add flashes" do
    expect(controller.instance_variable_get("@_flashes")).to be_blank

    controller.flash! notice: "Test"

    expect(controller.instance_variable_get("@_flashes")).to eq({ notice: ["Test"] })
  end

  it "has flashes in the response headers" do
    get :index, xhr: true

    flashes = JSON.parse(response.headers["X-Flash"])

    expect(flashes).to eq({ "notice" => ["Test"] })
  end

  it "should not include flash response header if not an ajax request" do
    get :index
    expect(response.headers).to_not have_key("X-Flash")

    get :index, xhr: true
    expect(response.headers).to have_key("X-Flash")
  end

end
