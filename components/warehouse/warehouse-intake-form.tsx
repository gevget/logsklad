"use client";

import { useMemo, useState } from "react";
import { Camera, Check } from "lucide-react";
import { recordWarehouseIntakeAction, recordWarehouseReleaseAction } from "@/features/orders/actions";

function signedDifference(value: number, suffix: string, fractionDigits = 0) {
  const sign = value > 0 ? "+" : "−";
  const formatted = Math.abs(value).toLocaleString("ru-RU", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  return `${sign}${formatted} ${suffix}`;
}

export function WarehouseIntakeForm({ orderId, expectedPlaces, expectedWeight, preview = false }: {
  orderId: string;
  expectedPlaces: number;
  expectedWeight: number;
  preview?: boolean;
}) {
  const [actualPlaces, setActualPlaces] = useState(String(expectedPlaces));
  const [actualWeight, setActualWeight] = useState(String(expectedWeight));
  const placesDifference = useMemo(() => (Number(actualPlaces) || 0) - expectedPlaces, [actualPlaces, expectedPlaces]);
  const weightDifference = useMemo(() => Number(((Number(actualWeight) || 0) - expectedWeight).toFixed(1)), [actualWeight, expectedWeight]);
  const hasDiscrepancy = placesDifference !== 0 || Math.abs(weightDifference) >= 0.01;

  return <form action={recordWarehouseIntakeAction} className="warehouse-intake-form">
    <input type="hidden" name="orderId" value={orderId} />
    <div className="warehouse-intake-values">
      <div className="warehouse-value-card expected"><span>Ожидалось</span><strong>{expectedPlaces.toLocaleString("ru-RU")} мест</strong><small>{expectedWeight.toLocaleString("ru-RU")} кг</small></div>
      <div className="warehouse-value-divider"><ArrowMark /></div>
      <div className={`warehouse-value-card actual${hasDiscrepancy ? " mismatch" : ""}`}><span>Фактически</span><strong>{(Number(actualPlaces) || 0).toLocaleString("ru-RU")} мест</strong><small>{(Number(actualWeight) || 0).toLocaleString("ru-RU")} кг</small></div>
    </div>
    {hasDiscrepancy ? <div className="warehouse-discrepancy" role="status" aria-live="polite"><span>Расхождение</span><div>{placesDifference !== 0 ? <strong>{signedDifference(placesDifference, "мест")}</strong> : null}{Math.abs(weightDifference) >= 0.01 ? <strong>{signedDifference(weightDifference, "кг", 1)}</strong> : null}</div></div> : <div className="warehouse-match"><Check size={15} /> Фактические данные совпадают с заявкой</div>}
    <div className="warehouse-intake-inputs">
      <label>Фактическое количество мест<input type="number" name="actualPlaces" min="0" max="10000" step="1" value={actualPlaces} onChange={(event) => setActualPlaces(event.currentTarget.value)} required /></label>
      <label>Фактический вес, кг<input type="number" name="actualWeightKg" min="0" max="1000000" step="0.1" value={actualWeight} onChange={(event) => setActualWeight(event.currentTarget.value)} required /></label>
    </div>
    <label className="warehouse-intake-note">Комментарий{hasDiscrepancy ? <small>Укажите причину расхождения — приёмка сохранится вместе с примечанием.</small> : <small>Можно добавить заметку для следующей смены.</small>}<textarea name="note" maxLength={1000} placeholder="Например: повреждена упаковка, фото добавлено" rows={3} required={hasDiscrepancy} /></label>
    <label className="warehouse-release-photo"><Camera size={16} /><span>Фото приёмки · необязательно</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={preview} /></label>
    <button className="button button-primary warehouse-intake-submit" type="submit" disabled={preview}><Check size={16} /> Подтвердить приёмку</button>
  </form>;
}

function ArrowMark() {
  return <span aria-hidden="true">→</span>;
}

export function WarehouseReleaseForm({
  orderId,
  quantity,
  driverName,
  vehicleName,
  vehiclePlateNumber,
  preview = false,
}: {
  orderId: string;
  quantity: number;
  driverName: string | null;
  vehicleName: string | null;
  vehiclePlateNumber: string | null;
  preview?: boolean;
}) {
  const assignmentReady = Boolean(driverName && vehicleName);
  const vehicleLabel = vehicleName ? `${vehicleName}${vehiclePlateNumber ? ` · ${vehiclePlateNumber}` : ""}` : "Не назначен";

  return <>
    <div className="warehouse-release-assignment">
      <span>Исходящий рейс назначает менеджер</span>
      <strong>{driverName || "Водитель не назначен"}</strong>
      <small>{vehicleLabel}</small>
    </div>
    {!assignmentReady ? <p className="warehouse-release-waiting" role="status">Перед выдачей менеджер должен назначить водителя и автомобиль.</p> : null}
    <form action={recordWarehouseReleaseAction} className="warehouse-intake-form warehouse-release-form">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="warehouse-intake-inputs">
        <label>Кому выдан груз<input type="text" name="recipientName" maxLength={180} placeholder="Фамилия и имя получателя" required disabled={preview || !assignmentReady} /></label>
        <label>Количество мест<input type="number" name="quantity" min="0" max="1000000" step="1" defaultValue={quantity} required disabled={preview || !assignmentReady} /></label>
      </div>
      <label>Адрес доставки<input type="text" name="destinationAddress" maxLength={500} placeholder="Город, улица, дом" required disabled={preview || !assignmentReady} /></label>
      <label>Телефон получателя<input type="tel" name="destinationContactPhone" maxLength={40} placeholder="+7 900 000-00-00" disabled={preview || !assignmentReady} /></label>
      <label className="warehouse-intake-note">Комментарий<textarea name="note" maxLength={1000} placeholder="Например: упаковка без повреждений" rows={2} disabled={preview || !assignmentReady} /></label>
      <label className="warehouse-release-photo"><Camera size={16} /><span>Фото или файл подтверждения · необязательно</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" disabled={preview || !assignmentReady} /></label>
      <button className="button button-primary warehouse-intake-submit" type="submit" disabled={preview || !assignmentReady}><Check size={16} /> Зафиксировать выдачу</button>
    </form>
  </>;
}
