import { PlanningBoard, type PlanningDriver, type PlanningPoint, type PlanningRow } from "@/components/manager/planning-board";
import { getDriverRoster, getOrdersForUser, getRoutePointsForOrders } from "@/features/orders/queries";

export async function PlanningView({ user }: { user: Parameters<typeof getOrdersForUser>[0] }) {
  const [rows, drivers] = await Promise.all([
    getOrdersForUser(user, { limit: 150 }),
    getDriverRoster(),
  ]);
  const points = await getRoutePointsForOrders(rows.map(({ order }) => order.id));
  const planningRows: PlanningRow[] = rows.map(({ order, companyName }) => ({
    order: { id: order.id, number: order.number, title: order.title, status: order.status, driverUserId: order.driverUserId, plannedPickupAt: order.plannedPickupAt },
    companyName,
  }));
  const planningDrivers: PlanningDriver[] = drivers.map(({ id, name, phone, isAvailable }) => ({ id, name, phone, isAvailable }));
  const planningPoints: PlanningPoint[] = points.map(({ id, orderId, type, label, addressText, plannedAt, sequence }) => ({ id, orderId, type, label, addressText, plannedAt, sequence }));
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return <PlanningBoard rows={planningRows} drivers={planningDrivers} points={planningPoints} todayKey={todayKey} />;
}
