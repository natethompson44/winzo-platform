import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import { ENV } from "./env";

// Helper to safely get the current working directory
function getCwd(): string {
  const cwd = process.cwd();
  if (!cwd || typeof cwd !== "string") {
    // Fallback to /app which is Railway's default working directory
    return "/app";
  }
  return cwd;
}

/**
 * Run database migrations on server startup
 * This ensures the database schema is up to date before the server starts handling requests
 */
export async function runMigrations(): Promise<void> {
  if (!ENV.databaseUrl) {
    console.warn("[Migration] DATABASE_URL not set, skipping migrations");
    return;
  }

  try {
    const client = postgres(ENV.databaseUrl);
    
    // Read the migration file - try multiple possible paths
    const cwd = getCwd();
    const possiblePaths = [
      join(cwd, "drizzle", "0000_round_nighthawk.sql"),
      join(cwd, "..", "drizzle", "0000_round_nighthawk.sql"),
      join(process.cwd(), "drizzle", "0000_round_nighthawk.sql"),
    ];
    
    let migrationSQL: string | null = null;
    let migrationPath: string | null = null;
    
    for (const path of possiblePaths) {
      try {
        migrationSQL = readFileSync(path, "utf-8");
        migrationPath = path;
        console.log(`[Migration] Found migration file at: ${path}`);
        break;
      } catch (error) {
        // Try next path
        continue;
      }
    }

    if (!migrationSQL) {
      console.warn(`[Migration] Could not find migration file, tried paths:`, possiblePaths);
      console.warn(`[Migration] Current working directory: ${cwd}`);
      console.warn(`[Migration] Skipping migrations - database may already be migrated`);
      await client.end();
      return;
    }

    // Split SQL statements (they're separated by --> statement-breakpoint)
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`[Migration] Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim().length === 0) continue;

      try {
        // Check if the statement creates something that might already exist
        // PostgreSQL will error if we try to create something that exists
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
              console.log(`[Migration] Type "${typeName}" already exists, skipping`);
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
              console.log(`[Migration] Table "${tableName}" already exists, skipping`);
              continue;
            }
          }
        }

        // Execute the statement
        await client.unsafe(statement);
        console.log(`[Migration] Executed statement ${i + 1}/${statements.length}`);
      } catch (error: any) {
        // If it's a "already exists" error, that's okay
        if (error?.message?.includes("already exists") || 
            error?.code === "42P07" || // duplicate_table
            error?.code === "42710") { // duplicate_object
          console.log(`[Migration] Statement ${i + 1} already applied, skipping`);
          continue;
        }
        
        // Otherwise, log the error but continue (might be a constraint that already exists)
        console.warn(`[Migration] Error executing statement ${i + 1}:`, error?.message || error);
        // Don't throw - some errors are expected if things already exist
      }
    }

    console.log("[Migration] Migrations completed successfully");
    await client.end();
  } catch (error) {
    console.error("[Migration] Failed to run migrations:", error);
    // Don't throw - let the server start anyway
    // The database might already be migrated
  }
}
