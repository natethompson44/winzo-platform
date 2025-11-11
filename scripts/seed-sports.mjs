import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { sports } from "../drizzle/schema.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// Sports data - matching what add-all-teams.mjs expects
const sportsData = [
  { name: "Football", code: "NFL", icon: "🏈" },
  { name: "Basketball", code: "NBA", icon: "🏀" },
  { name: "Hockey", code: "NHL", icon: "🏒" },
];

async function seedSports() {
  console.log("Seeding sports...\n");
  
  for (const sport of sportsData) {
    try {
      // Check if sport already exists
      const existing = await db.select().from(sports).where(eq(sports.code, sport.code));
      
      if (existing.length > 0) {
        console.log(`  ✓ ${sport.name} (${sport.code}) already exists`);
      } else {
        await db.insert(sports).values(sport);
        console.log(`  ✓ Added ${sport.name} (${sport.code})`);
      }
    } catch (error: any) {
      if (error.code === "23505") { // PostgreSQL unique violation
        console.log(`  ✓ ${sport.name} (${sport.code}) already exists`);
      } else {
        console.error(`  ✗ Error adding ${sport.name}:`, error.message);
      }
    }
  }
  
  console.log("\n✅ Sports seeding completed!");
}

seedSports()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Error:", err);
    await client.end();
    process.exit(1);
  });

