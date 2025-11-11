import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, wallets } from "../drizzle/schema.ts";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function initializeDatabase() {
  console.log("🚀 Initializing database...\n");
  
  // Step 1: Create owner account
  console.log("1. Creating owner account...");
  const username = "owner";
  const password = "owner";
  const name = "Platform Owner";
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
      name,
      role: "owner",
    }).returning();
    
    const ownerId = result[0].id;
    console.log(`   ✅ Owner account created (ID: ${ownerId})`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    
    // Step 2: Create wallet for owner
    console.log("\n2. Creating wallet for owner...");
    await db.insert(wallets).values({
      userId: ownerId,
      balance: 0,
    });
    console.log("   ✅ Wallet created");
    
  } catch (error: any) {
    if (error.code === "23505") { // PostgreSQL unique violation
      console.log("   ⚠️  Owner account already exists");
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
    } else {
      console.error("   ❌ Error:", error.message);
      throw error;
    }
  }
  
  console.log("\n✅ Database initialization completed!");
  console.log("\n📝 Next steps:");
  console.log("   1. Run: node scripts/seed-sports.mjs");
  console.log("   2. Run: node scripts/add-all-teams.mjs");
  console.log("   3. The odds sync will populate games automatically");
}

initializeDatabase()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("\n❌ Error:", err);
    await client.end();
    process.exit(1);
  });

