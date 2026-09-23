"use client";

import { useActionState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { resetDemoDataAction, type DemoResetState } from "@/features/admin/actions";

const initialState: DemoResetState = { status: "idle", message: "" };

export function DemoResetForm({ preview }: { preview: boolean }) {
  const [state, formAction, pending] = useActionState(resetDemoDataAction, initialState);

  return <section className="panel demo-reset-panel" aria-labelledby="demo-reset-title">
    <div className="demo-reset-icon"><ShieldAlert size={18} /></div>
    <div className="demo-reset-copy">
      <span className="eyebrow">АДМИНИСТРАТИВНОЕ ДЕЙСТВИЕ</span>
      <h2 id="demo-reset-title">Восстановить исходные данные</h2>
      <p>Сброс удалит внесённые изменения в базе и восстановит исходный сценарный набор. Привязанные локальные загрузки тоже удалятся. Операция недоступна в production.</p>
      <form action={formAction} className="demo-reset-form">
        <label htmlFor="demo-reset-confirmation">Для подтверждения введите <strong>ВОССТАНОВИТЬ ДЕМО</strong></label>
        <div className="demo-reset-controls">
          <input id="demo-reset-confirmation" name="confirmation" autoComplete="off" spellCheck={false} required disabled={preview || pending} />
          <button className="button demo-reset-button" type="submit" disabled={preview || pending}>
            <RefreshCw size={15} /> {pending ? "Восстанавливаем…" : "Восстановить демо"}
          </button>
        </div>
      </form>
      {preview ? <p className="demo-reset-feedback" role="status">В режиме просмотра дизайна сброс отключён.</p> : state.message ? <p className={`demo-reset-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
    </div>
  </section>;
}
