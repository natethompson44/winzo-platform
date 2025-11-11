import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "../drizzle/schema.ts";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createOwner() {
  const username = "admin";
  const password = "admin123"; // Change this!
  const name = "Platform Owner";
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await db.insert(users).values({
      username,
      password: hashedPassword,
      name,
      role: "owner",
    });
    
    console.log("✅ Owner account created successfully!");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("⚠️  Please change the password after first login!");
  } catch (error) {
    if (error.code === "23505") { // PostgreSQL unique violation
      console.log("Owner account already exists");
    } else {
      console.error("Error creating owner:", error);
    }
  }
  
  await client.end();
  process.exit(0);
}

createOwner();
