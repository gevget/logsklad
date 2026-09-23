import { Camera, Plus } from "lucide-react";
import { warehouseOperationTypeLabels, warehouseOperationTypeValues } from "@/config/warehouse-operations";
import { recordWarehouseOperationAction } from "@/features/orders/actions";

export function WarehouseOperationForm({ orderId, preview = false }: { orderId: string; preview?: boolean }) {
  return <form action={recordWarehouseOperationAction} className="warehouse-intake-form warehouse-operation-form">
    <input type="hidden" name="orderId" value={orderId} />
    <label className="warehouse-operation-type">Вид операции<select name="operationType" defaultValue={warehouseOperationTypeValues[0]} disabled={preview}>{warehouseOperationTypeValues.map((type) => <option key={type} value={type}>{warehouseOperationTypeLabels[type]}</option>)}</select></label>
    <div className="warehouse-intake-inputs">
      <label>Количество мест<input type="number" name="quantity" min="0" max="1000000" step="1" placeholder="Необязательно" disabled={preview} /></label>
      <label>Вес, кг<input type="number" name="weightKg" min="0" max="1000000" step="0.1" placeholder="Необязательно" disabled={preview} /></label>
    </div>
    <label className="warehouse-intake-note">Результат<textarea name="resultText" maxLength={1000} placeholder="Например: груз разгружен без повреждений" rows={2} required disabled={preview} /></label>
    <label className="warehouse-intake-note">Комментарий<textarea name="note" maxLength={1000} placeholder="Дополнительные сведения для журнала" rows={2} disabled={preview} /></label>
    <label className="warehouse-release-photo"><Camera size={16} /><span>Фото операции · необязательно</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={preview} /></label>
    <button className="button button-primary warehouse-intake-submit" type="submit" disabled={preview}><Plus size={16} /> Записать операцию</button>
  </form>;
}
