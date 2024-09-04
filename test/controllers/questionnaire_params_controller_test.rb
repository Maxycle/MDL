require "test_helper"

class QuestionnaireParamsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get questionnaire_params_show_url
    assert_response :success
  end

  test "should get update" do
    get questionnaire_params_update_url
    assert_response :success
  end
end
