import Link from "next/link";
import { FileText, Image as ImageIcon, Download } from "lucide-react";
import { getDocumentsForUser } from "@/features/documents/queries";

export async function DocumentsView({ user, preview = false }: { user: Parameters<typeof getDocumentsForUser>[0]; preview?: boolean }) {
  const rows = await getDocumentsForUser(user);
  if (!rows.length) return <section className="panel notification-empty"><div className="empty-mark"><FileText size={21} /></div><h2>Документов пока нет</h2><p>Файлы по доступным вам заявкам появятся здесь.</p></section>;
  return <section className="panel document-list">{rows.map(({ attachment, order, document }) => {
    const isImage = attachment.mimeType?.startsWith("image/");
    return <article className="document-row" key={attachment.id}><span className="notification-icon">{isImage ? <ImageIcon size={16} /> : <FileText size={16} />}</span><div className="document-copy"><strong>{document?.title ?? attachment.filename}</strong><p>{order.number} · {attachment.category.replaceAll("_", " ").toLowerCase()}</p><small>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(attachment.createdAt)} · {formatBytes(attachment.sizeBytes ?? 0)}</small></div><Link className="icon-button" href={preview ? "/demo/cargo-placeholder.svg" : `/api/attachments/${attachment.id}`} target="_blank" rel="noreferrer" aria-label="Открыть документ"><Download size={15} /></Link></article>;
  })}</section>;
}

function formatBytes(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} КБ` : `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}
