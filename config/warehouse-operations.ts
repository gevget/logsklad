export const warehouseOperationTypeValues = [
  "UNLOADING",
  "WEIGHING",
  "STORAGE",
  "PACKING",
  "LABELING",
  "CUTTING",
  "LOADING",
] as const;

export type WarehouseOperationType = (typeof warehouseOperationTypeValues)[number];

export const warehouseOperationTypeLabels: Record<WarehouseOperationType, string> = {
  UNLOADING: "Разгрузка",
  WEIGHING: "Взвешивание",
  STORAGE: "Размещение на хранение",
  PACKING: "Упаковка",
  LABELING: "Маркировка",
  CUTTING: "Резка / обработка",
  LOADING: "Погрузка",
};
