import { CheckCircle2, CircleOff } from "lucide-react";
import { getDriverRoster } from "@/features/orders/queries";

export async function DriversView() {
  const drivers = await getDriverRoster();
  return <section className="panel manager-driver-list">{drivers.map((driver) => <article className="manager-driver-row" key={driver.id}><span className={`driver-availability ${driver.isAvailable ? "available" : "busy"}`}>{driver.isAvailable ? <CheckCircle2 size={17} /> : <CircleOff size={17} />}</span><div><strong>{driver.name}</strong><small>{driver.phone ?? driver.email}</small></div><span className="driver-license">{driver.license ? `Удостоверение ${driver.license}` : "Данные удостоверения не указаны"}</span><span className={`driver-state ${driver.isAvailable ? "available" : "busy"}`}>{driver.isAvailable ? "Доступен" : "В рейсе"}</span></article>)}{!drivers.length ? <p className="planning-empty">Активных водителей пока нет.</p> : null}</section>;
}
