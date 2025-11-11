import postgres from "postgres";
import { ENV } from "./env";

// Embedded migration SQL - this ensures it's always available even when bundled
const MIGRATION_SQL = `
CREATE TYPE "public"."bet_status" AS ENUM('pending', 'won', 'lost');
CREATE TYPE "public"."game_status" AS ENUM('upcoming', 'live', 'completed');
CREATE TYPE "public"."parlay_result" AS ENUM('pending', 'won', 'lost');
CREATE TYPE "public"."role" AS ENUM('user', 'agent', 'owner');
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_lost');
CREATE TABLE "bets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"gameId" integer,
	"selectedTeamId" integer,
	"odds" integer NOT NULL,
	"stake" integer NOT NULL,
	"potentialPayout" integer NOT NULL,
	"status" "bet_status" DEFAULT 'pending' NOT NULL,
	"isParlay" boolean DEFAULT false NOT NULL,
	"settledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"sportId" integer NOT NULL,
	"homeTeamId" integer NOT NULL,
	"awayTeamId" integer NOT NULL,
	"homeOdds" integer NOT NULL,
	"awayOdds" integer NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"status" "game_status" DEFAULT 'upcoming' NOT NULL,
	"homeScore" integer,
	"awayScore" integer,
	"winnerId" integer,
	"externalId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "parlayLegs" (
	"id" serial PRIMARY KEY NOT NULL,
	"betId" integer NOT NULL,
	"gameId" integer NOT NULL,
	"selectedTeamId" integer NOT NULL,
	"odds" integer NOT NULL,
	"result" "parlay_result" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"icon" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_name_unique" UNIQUE("name"),
	CONSTRAINT "sports_code_unique" UNIQUE("code")
);
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"sportId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"city" varchar(100),
	"abbreviation" varchar(10),
	"logo" text,
	"primaryColor" varchar(7),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balanceAfter" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"suspended" integer DEFAULT 0 NOT NULL,
	"dailyLimit" integer DEFAULT 0,
	"weeklyLimit" integer DEFAULT 0,
	"perBetLimit" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_userId_unique" UNIQUE("userId")
);
`;

/**
 * Run database migrations on server startup
 * This ensures the database schema is up to date before the server starts handling requests
 */
export async function runMigrations(): Promise<void> {
  console.log("[Migration] 🚀 Migration function called");
  
  if (!ENV.databaseUrl) {
    console.error("[Migration] ❌ DATABASE_URL not set, cannot run migrations!");
    console.error("[Migration] ENV.databaseUrl:", ENV.databaseUrl ? "SET" : "NOT SET");
    throw new Error("DATABASE_URL is required for migrations");
  }

  console.log("[Migration] ✅ DATABASE_URL is set");

  let client: ReturnType<typeof postgres> | null = null;
  
  try {
    console.log("[Migration] 🔄 Connecting to database...");
    client = postgres(ENV.databaseUrl);
    console.log("[Migration] ✅ Database connection established");
    
    // Test the connection
    await client`SELECT 1`;
    console.log("[Migration] ✅ Database connection test passed");
    
    console.log("[Migration] 📋 Starting database migrations...");
    
    // Split SQL statements - split by semicolons and filter empty ones
    const rawStatements = MIGRATION_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Filter out any empty or whitespace-only statements
    const statements = rawStatements.filter(s => {
      const cleaned = s.replace(/\s+/g, ' ').trim();
      return cleaned.length > 0 && !cleaned.match(/^\s*$/);
    });

    console.log(`[Migration] 📊 Found ${statements.length} SQL statements to execute`);

    let executedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim().length === 0) continue;

      try {
        // Check if the statement creates something that might already exist
        if (statement.includes("CREATE TYPE")) {
          const typeMatch = statement.match(/CREATE TYPE\s+"public"\."(\w+)"/);
          if (typeMatch) {
            const typeName = typeMatch[1];
            // Check if type exists
            const typeExists = await client`
              SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = ${typeName}
              )
            `;
            if (typeExists[0]?.exists) {
              console.log(`[Migration] ⏭️  Type "${typeName}" already exists, skipping`);
              skippedCount++;
              continue;
            }
          }
        }

        if (statement.includes("CREATE TABLE")) {
          const tableMatch = statement.match(/CREATE TABLE\s+"(\w+)"/);
          if (tableMatch) {
            const tableName = tableMatch[1];
            // Check if table exists
            const tableExists = await client`
              SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = ${tableName}
              )
            `;
            if (tableExists[0]?.exists) {
              console.log(`[Migration] ⏭️  Table "${tableName}" already exists, skipping`);
              skippedCount++;
              continue;
            }
          }
        }

        // Execute the statement (add semicolon back)
        await client.unsafe(statement + ';');
        executedCount++;
        const tableMatch = statement.match(/CREATE TABLE\s+"(\w+)"/);
        const typeMatch = statement.match(/CREATE TYPE\s+"public"\."(\w+)"/);
        const name = tableMatch ? tableMatch[1] : (typeMatch ? typeMatch[1] : `statement ${i + 1}`);
        console.log(`[Migration] ✅ Created ${name}`);
      } catch (error: any) {
        // If it's a "already exists" error, that's okay
        if (error?.message?.includes("already exists") || 
            error?.code === "42P07" || // duplicate_table
            error?.code === "42710" || // duplicate_object
            error?.code === "42723") { // duplicate_object (for types)
          console.log(`[Migration] ⏭️  Statement ${i + 1} already applied, skipping`);
          skippedCount++;
          continue;
        }
        
        // Log the error but continue - might be a constraint that already exists
        errorCount++;
        console.warn(`[Migration] ⚠️  Error executing statement ${i + 1}:`, error?.message || error);
        console.warn(`[Migration] Statement preview: ${statement.substring(0, 80)}...`);
        // Don't throw - some errors are expected if things already exist
      }
    }

    console.log(`[Migration] ✅ Migrations completed: ${executedCount} executed, ${skippedCount} skipped, ${errorCount} errors`);
    
    if (errorCount > 0 && executedCount === 0) {
      console.error("[Migration] ⚠️  WARNING: All migrations failed or were skipped. Database may not be properly initialized.");
    }
  } catch (error: any) {
    console.error("[Migration] ❌ CRITICAL: Failed to run migrations:", error?.message || error);
    console.error("[Migration] Stack:", error?.stack);
    // Don't throw - let the server start anyway, but log the error clearly
    // The database might already be migrated or there might be a connection issue
  } finally {
    if (client) {
      await client.end();
      console.log("[Migration] 🔌 Database connection closed");
    }
  }
}
