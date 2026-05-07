class ApplicationController < ActionController::Base
  helper_method :current_user_name

  def current_user_name
    session[:user_name].to_s
  end
end