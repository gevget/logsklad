import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { isDemoRole } from "@/features/demo/identity";

type RoleLayoutProps = {
  children: ReactNode;
  params: Promise<{ role: string }>;
};

export default async function RoleLayout({ children, params }: RoleLayoutProps) {
  const [{ role: requestedRole }, user] = await Promise.all([params, getCurrentDemoUser()]);
  const role = requestedRole.toUpperCase();
  if (!isDemoRole(role) || role !== user.role) redirect(`/${user.role.toLowerCase()}`);
  return children;
}
