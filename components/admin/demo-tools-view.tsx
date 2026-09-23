import { ArrowRight, Building2, Package, Settings2, Truck, Warehouse } from "lucide-react";
import { setDemoIdentityAction } from "@/features/demo/actions";
import type { DemoRole } from "@/features/demo/identity";
import { DemoResetForm } from "@/components/admin/demo-reset-form";

const roles: { role: DemoRole; label: string; description: string; icon: typeof Package }[] = [
  { role: "CLIENT", label: "Заказчик", description: "Создание заявки, документы и отслеживание перевозки.", icon: Package },
  { role: "MANAGER", label: "Менеджер", description: "Входящие заявки, согласование и назначения.", icon: Settings2 },
  { role: "DRIVER", label: "Водитель", description: "Задания, маршрут, статусы рейса и фото.", icon: Truck },
  { role: "WAREHOUSE", label: "Склад", description: "Ожидаемые поставки, приёмка и обработка.", icon: Warehouse },
  { role: "ADMIN", label: "Администратор", description: "Учётные записи, компании и справочники.", icon: Building2 },
];

export function DemoToolsView({ preview, resetAvailable }: { preview: boolean; resetAvailable: boolean }) {
  return <div className="demo-tools-layout">
    <section className="panel demo-flow-card">
      <span className="eyebrow">СКВОЗНОЙ СЦЕНАРИЙ</span>
      <h2>{preview ? "Изучите рабочие экраны каждой роли" : "Проведите заявку через всю команду"}</h2>
      <p>{preview
        ? "Сейчас показаны примерные данные, а изменения не сохраняются. Для сквозного сценария с одной заявкой нужна рабочая база."
        : "Начните с заявки заказчика и переключайтесь между ролями. Все участники увидят её изменения и общую историю."}</p>
      <div className="demo-flow-steps"><span>Заказчик</span><ArrowRight size={15} /><span>Менеджер</span><ArrowRight size={15} /><span>Водитель</span><ArrowRight size={15} /><span>Склад</span><ArrowRight size={15} /><span>Менеджер</span><ArrowRight size={15} /><span>Заказчик</span></div>
      <div className="demo-preview-state"><span className="aside-dot" /><span>{preview ? "Примерные данные · действия не сохраняются" : "Demo Mode · данные рабочей базы"}</span></div>
    </section>
    <section className="panel demo-entry-panel" aria-labelledby="demo-entry-title">
      <div className="panel-heading"><div><span className="eyebrow">БЫСТРЫЙ ПЕРЕХОД</span><h2 id="demo-entry-title">Начать с рабочего экрана</h2></div></div>
      <div className="demo-entry-grid">
        <form action={setDemoIdentityAction}><input type="hidden" name="role" value="CLIENT" /><input type="hidden" name="destination" value="/client/orders/new" /><button className="demo-entry-card" type="submit"><span>Заказчик</span><strong>Создать заявку</strong><small>Маршрут, груз и услуги</small><ArrowRight size={16} /></button></form>
        <form action={setDemoIdentityAction}><input type="hidden" name="role" value="MANAGER" /><input type="hidden" name="destination" value="/manager/incoming" /><button className="demo-entry-card" type="submit"><span>Менеджер</span><strong>Входящие заявки</strong><small>Проверка и назначение рейса</small><ArrowRight size={16} /></button></form>
        <form action={setDemoIdentityAction}><input type="hidden" name="role" value="DRIVER" /><input type="hidden" name="destination" value="/driver" /><button className="demo-entry-card" type="submit"><span>Водитель</span><strong>Сегодня в рейсе</strong><small>Задания и ближайшие действия</small><ArrowRight size={16} /></button></form>
        <form action={setDemoIdentityAction}><input type="hidden" name="role" value="WAREHOUSE" /><input type="hidden" name="destination" value="/warehouse/intake" /><button className="demo-entry-card" type="submit"><span>Склад</span><strong>Открыть приёмку</strong><small>Сверка груза и складские операции</small><ArrowRight size={16} /></button></form>
      </div>
    </section>
    <section className="demo-role-grid" aria-label="Переключение демонстрационной роли">
      {roles.map(({ role, label, description, icon: Icon }) => <article className="panel demo-role-card" key={role}>
        <span className="demo-role-icon"><Icon size={18} /></span>
        <div><span className="eyebrow">{label.toUpperCase()}</span><p>{description}</p></div>
        <form action={setDemoIdentityAction}><input type="hidden" name="role" value={role} /><button className="button button-secondary" type="submit">Открыть кабинет <ArrowRight size={15} /></button></form>
      </article>)}
    </section>
    {resetAvailable ? <DemoResetForm preview={preview} /> : null}
  </div>;
}
