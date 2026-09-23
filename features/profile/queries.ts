import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { companies, driverProfiles, type Company, type DriverProfile, type User } from "@/db/schema";
import { designPreviewEnabled, previewCompany, previewDriverProfile } from "@/lib/design-preview/data";

export async function getProfileData(user: User) {
  if (designPreviewEnabled) return {
    company: (user.role === "CLIENT" ? previewCompany : undefined) as Company | undefined,
    driver: (user.role === "DRIVER" ? previewDriverProfile : undefined) as DriverProfile | undefined,
  };
  const { db } = getDatabase();
  const [company] = user.role === "CLIENT" && user.companyId
    ? await db.select().from(companies).where(eq(companies.id, user.companyId)).limit(1)
    : [];
  const [driver] = user.role === "DRIVER"
    ? await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1)
    : [];
  return { company, driver };
}
