require 'rails_helper'

describe Voltron::Asset do

  let(:assets) { Voltron::Asset.new }

  it 'can find all assets' do
    expect(assets.files).to be_a(Hash)
  end

  it 'should return nil if file does not exist' do
    expect(assets.find('missing.png')).to be_nil
  end

  it 'should return a file path if the file exists' do
  	expect(assets.find('1.jpg')).to_not be_blank
  	expect(assets.find('1.jpg')).to match(/\/1\.jpg$/)
  end

  it 'should return an asset path if the file exists' do
    expect(assets.file_path('1.jpg')).to match(/\/assets\/1\-[a-z0-9]+\.jpg/)
    expect(assets.file_path('missing.jpg')).to eq('/assets/missing.jpg')
  end
end
