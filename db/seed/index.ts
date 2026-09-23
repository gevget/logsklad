import { getDatabase } from "../index";
import { seedDemoData } from "./data";

async function main() {
  const counts = await seedDemoData();
  console.info("Demo dataset is ready:");
  for (const [table, count] of Object.entries(counts)) console.info(`- ${table}: ${count}`);
  await getDatabase().client.end({ timeout: 5 });
}

main().catch(async (error: unknown) => {
  console.error("Demo seed failed.", error);
  try {
    await getDatabase().client.end({ timeout: 2 });
  } catch {
    // A connection may not have been created if environment validation failed.
  }
  process.exitCode = 1;
});
