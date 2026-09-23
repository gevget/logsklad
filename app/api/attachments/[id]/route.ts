import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { attachments, orders } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/permissions";
import { createStorageSignedUrl, readLocalStorageObject } from "@/features/files/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getCurrentDemoUser();
    const { id } = await params;
    const { db } = getDatabase();
    const [row] = await db.select({ attachment: attachments, order: orders }).from(attachments)
      .innerJoin(orders, eq(orders.id, attachments.orderId)).where(and(eq(attachments.id, id), eq(orders.id, attachments.orderId))).limit(1);
    if (!row) return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
    requirePermission(actor, "files:view", row.order);
    const canSeeInternalFiles = actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "WAREHOUSE";
    if (!canSeeInternalFiles && row.attachment.visibility !== "CLIENT") return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
    if (row.attachment.storagePath.startsWith("demo/")) return NextResponse.redirect(new URL(`/${row.attachment.storagePath}`, _request.url));
    if (row.attachment.storagePath.startsWith("local/")) {
      if (!row.attachment.storagePath.startsWith(`local/${row.order.id}/`)) return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
      const file = await readLocalStorageObject(row.attachment.storagePath);
      const contentType = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(row.attachment.mimeType ?? "")
        ? row.attachment.mimeType!
        : "application/octet-stream";
      const filename = (row.attachment.filename || "attachment").replace(/[\r\n"\\]/g, "_");
      const encodedFilename = encodeURIComponent(filename).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
      return new Response(new Uint8Array(file), {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(file.byteLength),
          "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return NextResponse.redirect(await createStorageSignedUrl(row.attachment.storagePath));
  } catch {
    return NextResponse.json({ error: "Не удалось открыть файл." }, { status: 403 });
  }
}
