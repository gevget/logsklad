import type { Order } from "@/db/schema";

export const warehouseOrderTypes: ReadonlySet<Order["type"]> = new Set([
  "PICKUP_TO_WAREHOUSE",
  "WAREHOUSE_INTAKE",
  "WAREHOUSE_SERVICE",
]);
