import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getRoleIdentity } from "@/features/demo/identity";
import { getUnreadNotificationCount } from "@/features/notifications/queries";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { designPreviewEnabled } from "@/lib/design-preview/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentDemoUser();
  const identity = getRoleIdentity(user.role);
  const unreadNotificationCount = await getUnreadNotificationCount(user);
  const showDemoTools = process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";

  return <AppShell identity={identity} preview={designPreviewEnabled} showDemoTools={showDemoTools} unreadNotificationCount={unreadNotificationCount}>{children}</AppShell>;
}
