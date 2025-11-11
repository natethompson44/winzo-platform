import bcrypt from "bcrypt";
import * as db from "./db";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(username: string, password: string, name: string, role: "user" | "agent" | "owner" = "user") {
  const hashedPassword = await hashPassword(password);
  
  const newUser = await db.createUserWithPassword({
    username,
    password: hashedPassword,
    name,
    role,
  });
  
  return newUser;
}

export async function authenticateUser(username: string, password: string) {
  const user = await db.getUserByUsername(username);
  
  if (!user) {
    return null;
  }
  
  if (user.suspended === 1) {
    throw new Error("Account suspended");
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  // Update last signed in
  await db.updateLastSignedIn(user.id);
  
  return user;
}

export async function changePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  await db.updateUserPassword(userId, hashedPassword);
}
