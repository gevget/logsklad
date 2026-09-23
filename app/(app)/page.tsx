import { redirect } from "next/navigation";
import { getDemoIdentity } from "@/features/demo/identity";
import { getCurrentDemoUser } from "@/lib/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentDemoUser();
  const identity = getDemoIdentity(user.email);
  redirect(identity.route);
}
