import { getDatabase } from "../index";
import { seedDemoData } from "./data";

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("Demo data reset is disabled in production.");
  }
  if (process.env.DEMO_MODE !== "true" || process.env.RESET_DEMO_DATA !== "true") {
    throw new Error("Set DEMO_MODE=true and RESET_DEMO_DATA=true to confirm clearing this demo database.");
  }

  const counts = await seedDemoData({ reset: true });
  console.info("Demo database reset and reseeded:");
  for (const [table, count] of Object.entries(counts)) console.info(`- ${table}: ${count}`);
  await getDatabase().client.end({ timeout: 5 });
}

main().catch(async (error: unknown) => {
  console.error("Demo reset failed.", error);
  try {
    await getDatabase().client.end({ timeout: 2 });
  } catch {
    // A connection may not have been created if environment validation failed.
  }
  process.exitCode = 1;
});
