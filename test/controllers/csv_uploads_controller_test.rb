require "test_helper"

class CsvUploadsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get csv_uploads_create_url
    assert_response :success
  end
end
