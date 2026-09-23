"use client";

import { useId, useRef } from "react";
import { changeOrderStatusAction } from "@/features/orders/actions";

export function DriverActionForm({ orderId, nextStatus, label, confirmMessage, disabled = false }: {
  orderId: string;
  nextStatus: string;
  label: string;
  confirmMessage?: string;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = useId();

  function confirmAction() {
    dialogRef.current?.close();
    formRef.current?.requestSubmit();
  }

  return <>
    <form ref={formRef} action={changeOrderStatusAction} className="driver-primary-action">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      {confirmMessage
        ? <button className="button button-primary" type="button" disabled={disabled} onClick={() => dialogRef.current?.showModal()}>{label}</button>
        : <button className="button button-primary" type="submit" disabled={disabled}>{label}</button>}
    </form>
    {confirmMessage ? <dialog ref={dialogRef} className="driver-confirm-dialog" aria-labelledby={dialogTitleId}>
      <div className="driver-confirm-dialog-content">
        <h2 id={dialogTitleId}>Подтверждение шага</h2>
        <p>{confirmMessage}</p>
        <div className="driver-confirm-dialog-actions">
          <button className="button button-secondary" type="button" onClick={() => dialogRef.current?.close()}>Вернуться</button>
          <button className="button button-primary" type="button" onClick={confirmAction}>Подтвердить</button>
        </div>
      </div>
    </dialog> : null}
  </>;
}
