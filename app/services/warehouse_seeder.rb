class WarehouseSeeder
  ITEMS = [
    {
      name: "Катушки PLA",
      category: "Пластик",
      material: "PLA",
      quantity: 12,
      unit: "катушек",
      location: "shelf",
      description: "Пластик для учебной 3D-печати и быстрых прототипов."
    },
    {
      name: "Катушки PETG",
      category: "Пластик",
      material: "PETG",
      quantity: 7,
      unit: "катушек",
      location: "shelf",
      description: "Прочный пластик для функциональных деталей."
    },
    {
      name: "Катушки ABS",
      category: "Пластик",
      material: "ABS",
      quantity: 4,
      unit: "катушек",
      location: "shelf",
      description: "Термостойкий пластик для технических изделий."
    },
    {
      name: "Листы алюминия 2 мм",
      category: "Металл",
      material: "Алюминий",
      quantity: 18,
      unit: "листов",
      location: "shelf",
      description: "Листы алюминия для фрезеровки и обработки."
    },
    {
      name: "Стальные прутки",
      category: "Металл",
      material: "Сталь",
      quantity: 24,
      unit: "шт",
      location: "shelf",
      description: "Стальные заготовки для токарных работ."
    },
    {
      name: "Латунные прутки",
      category: "Металл",
      material: "Латунь",
      quantity: 15,
      unit: "шт",
      location: "shelf",
      description: "Латунные заготовки для демонстрационных деталей."
    },
    {
      name: "Набор фрез",
      category: "Оснастка",
      material: "Инструментальная сталь",
      quantity: 1,
      unit: "набор",
      location: "shelf",
      description: "Комплект фрез для фрезерных станков."
    },
    {
      name: "Набор сверл",
      category: "Оснастка",
      material: "HSS",
      quantity: 2,
      unit: "набора",
      location: "shelf",
      description: "Наборы сверл для сверлильного оборудования."
    },
    {
      name: "Наждачная бумага",
      category: "Расходники",
      material: "Абразив",
      quantity: 30,
      unit: "упаковок",
      location: "shelf",
      description: "Абразивный материал для шлифовки поверхностей."
    },
    {
      name: "Смазочно-охлаждающая жидкость",
      category: "Расходники",
      material: "Масло",
      quantity: 6,
      unit: "бутылок",
      location: "shelf",
      description: "СОЖ для обработки металла."
    },
    {
      name: "Набор крепежа",
      category: "Крепёж",
      material: "Mixed",
      quantity: 8,
      unit: "наборов",
      location: "shelf",
      description: "Комплекты болтов, гаек и шайб."
    },
    {
      name: "Набор подшипников",
      category: "Комплектующие",
      material: "Сталь",
      quantity: 10,
      unit: "наборов",
      location: "shelf",
      description: "Подшипники для учебных сборок и механизмов."
    }
  ].freeze

  def self.seed!
    return if WarehouseItem.where(location: "shelf").exists?

    WarehouseItem.transaction do
      ITEMS.each do |attrs|
        WarehouseItem.create!(attrs)
      end
    end
  end
end