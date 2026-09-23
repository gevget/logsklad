import { getAdminDirectory } from "@/features/admin/queries";
import { AdminDirectoryTable } from "@/components/admin/admin-directory-table";

export async function AdminDirectoryView({ user, section, preview = false }: { user: Parameters<typeof getAdminDirectory>[0]; section: string; preview?: boolean }) {
  const directory = await getAdminDirectory(user, section);
  if (!directory.rows.length) return <section className="panel notification-empty"><h2>Записей пока нет</h2><p>Когда данные появятся в системе, они будут показаны здесь.</p></section>;
  return <AdminDirectoryTable directory={directory} section={section} preview={preview} />;
}
