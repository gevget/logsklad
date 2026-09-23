import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { getUserNotifications } from "@/features/notifications/queries";
import { markNotificationReadAction } from "@/features/notifications/actions";

export async function NotificationsView({ user, preview = false }: { user: Parameters<typeof getUserNotifications>[0]; preview?: boolean }) {
  const items = await getUserNotifications(user);
  if (!items.length) return <section className="panel notification-empty"><div className="empty-mark"><Bell size={21} /></div><h2>Вы в курсе событий</h2><p>Новые обновления по заявкам появятся здесь.</p></section>;
  return <section className="panel notification-list">{items.map((item) => <article className={`notification-row ${item.isRead ? "read" : "unread"}`} key={item.id}><span className="notification-icon"><Bell size={16} /></span><div className="notification-copy"><strong>{item.title}</strong><p>{item.body || "Откройте заявку, чтобы посмотреть подробности."}</p><small>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</small></div><div className="notification-actions">{item.orderId ? <Link className="text-link" href={user.role === "DRIVER" ? `/driver/jobs/${item.orderId}` : `/${user.role.toLowerCase()}/orders/${item.orderId}`}>Открыть</Link> : null}{!item.isRead ? preview ? <button className="icon-button" type="button" disabled aria-label="Действия недоступны в просмотре дизайна"><Check size={16} /></button> : <form action={markNotificationReadAction}><input type="hidden" name="notificationId" value={item.id} /><button className="icon-button" type="submit" aria-label="Отметить прочитанным"><Check size={16} /></button></form> : null}</div></article>)}</section>;
}
