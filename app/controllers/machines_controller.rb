class MachinesController < ApplicationController
  def index
    render json: Machine.all
  end

  def show
    render json: Machine.find(params[:id])
  end
end