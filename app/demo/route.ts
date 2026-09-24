import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoleIdentity } from "@/features/demo/identity";

export async function GET() {
  const identity = getRoleIdentity("CLIENT");
  const cookieStore = await cookies();

  cookieStore.set("demo_identity", identity.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(identity.route);
}