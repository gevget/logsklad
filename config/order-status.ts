import type { OrderStatus } from "@/db/schema";

export const orderStatusConfig: Record<OrderStatus, { label: string; tone: "neutral" | "info" | "accent" | "warning" | "success" | "danger" }> = {
  DRAFT: { label: "Черновик", tone: "neutral" },
  SUBMITTED: { label: "Отправлена", tone: "info" },
  REVIEW: { label: "На проверке", tone: "info" },
  CONFIRMED: { label: "Согласована", tone: "accent" },
  DRIVER_ASSIGNED: { label: "Водитель назначен", tone: "accent" },
  PICKUP_IN_PROGRESS: { label: "Водитель едет на забор", tone: "warning" },
  PICKED_UP: { label: "Груз забран", tone: "info" },
  AT_WAREHOUSE: { label: "Принят на склад", tone: "info" },
  WAREHOUSE_PROCESSING: { label: "Обработка на складе", tone: "warning" },
  READY_FOR_DELIVERY: { label: "Готов к отправке", tone: "accent" },
  DELIVERY_IN_PROGRESS: { label: "В доставке", tone: "warning" },
  DELIVERED: { label: "Доставлен", tone: "success" },
  COMPLETED: { label: "Завершена", tone: "success" },
  ON_HOLD: { label: "Приостановлена", tone: "warning" },
  ISSUE: { label: "Требует внимания", tone: "danger" },
  CANCELLED: { label: "Отменена", tone: "neutral" },
};

export const orderMilestones: Record<OrderStatus, string> = {
  DRAFT: "Создано",
  SUBMITTED: "Заявка отправлена",
  REVIEW: "Проверка данных",
  CONFIRMED: "Согласовано",
  DRIVER_ASSIGNED: "Подготовка к забору",
  PICKUP_IN_PROGRESS: "Забор груза",
  PICKED_UP: "Груз забран",
  AT_WAREHOUSE: "Приёмка на складе",
  WAREHOUSE_PROCESSING: "Обработка",
  READY_FOR_DELIVERY: "Подготовка к доставке",
  DELIVERY_IN_PROGRESS: "Доставка",
  DELIVERED: "Доставлено",
  COMPLETED: "Завершено",
  ON_HOLD: "Приостановлено",
  ISSUE: "Требует внимания",
  CANCELLED: "Отменено",
};
