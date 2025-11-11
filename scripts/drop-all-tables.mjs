import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);

async function dropAllTables() {
  console.log("⚠️  WARNING: This will DROP ALL TABLES in the database!");
  console.log("This script will drop:");
  console.log("  - users, sports, teams, games, wallets, transactions, bets, parlayLegs");
  console.log("  - All enum types (role, bet_status, game_status, etc.)");
  console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...");
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log("\n🔄 Dropping all tables and types...");
    
    // Drop tables in order (respecting foreign keys)
    const tables = [
      "parlayLegs",
      "bets", 
      "transactions",
      "wallets",
      "games",
      "teams",
      "sports",
      "users"
    ];
    
    for (const table of tables) {
      try {
        await client.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`  ✅ Dropped table: ${table}`);
      } catch (error: any) {
        console.warn(`  ⚠️  Error dropping ${table}:`, error.message);
      }
    }
    
    // Drop enum types
    const enums = [
      "bet_status",
      "game_status", 
      "parlay_result",
      "role",
      "transaction_type"
    ];
    
    for (const enumType of enums) {
      try {
        await client.unsafe(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`  ✅ Dropped type: ${enumType}`);
      } catch (error: any) {
        console.warn(`  ⚠️  Error dropping ${enumType}:`, error.message);
      }
    }
    
    console.log("\n✅ All tables and types dropped successfully!");
    console.log("You can now redeploy and migrations will create fresh tables.");
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

dropAllTables()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });

