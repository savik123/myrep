class WarehouseItemsController < ApplicationController
  before_action :set_warehouse_item, only: [:take]

  def index
    render json: WarehouseItem.order(:category, :name)
  end

  def shelf
    render json: WarehouseItem.where(location: "shelf").order(:category, :name)
  end

  def take
    user_name = current_user_name

    if user_name.blank?
      render json: { ok: false, error: "Пользователь не зарегистрирован" }, status: :unauthorized
      return
    end

    WarehouseTransaction.create!(
      user_name: user_name,
      warehouse_item: @warehouse_item,
      item_name_snapshot: @warehouse_item.name,
      quantity_changed: 1,
      action: "take"
    )

    if @warehouse_item.quantity.to_i > 1
      @warehouse_item.update!(quantity: @warehouse_item.quantity - 1)
      render json: { ok: true, deleted: false, item: @warehouse_item }
    else
      id = @warehouse_item.id
      @warehouse_item.destroy!
      render json: { ok: true, deleted: true, item_id: id }
    end
  end

  private

  def set_warehouse_item
    @warehouse_item = WarehouseItem.find(params[:id])
  end
end