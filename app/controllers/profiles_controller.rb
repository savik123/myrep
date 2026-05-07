class ProfilesController < ApplicationController
  def create
    name = params[:name].to_s.strip

    if name.blank?
      render json: { ok: false, error: "Имя не может быть пустым" }, status: :unprocessable_entity
      return
    end

    session[:user_name] = name
    render json: { ok: true, name: name }
  end
end