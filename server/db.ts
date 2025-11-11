import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, sports, teams, games, wallets, transactions, bets, InsertWallet, InsertTransaction, InsertBet, parlayLegs, InsertParlayLeg, InsertGame } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUserWithPassword(user: { username: string; password: string; name: string; role?: "user" | "agent" | "owner" }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values({
    username: user.username,
    password: user.password,
    name: user.name,
    role: user.role || "user",
  });

  return result;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
}

// Sports queries
export async function getAllSports() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sports);
}

// Teams queries
export async function getTeamsBySport(sportId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(teams).where(eq(teams.sportId, sportId));
}

export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(teams);
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Games queries
export async function getAllGames() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(games).orderBy(games.scheduledAt);
}

export async function getGamesBySport(sportId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(games).where(eq(games.sportId, sportId)).orderBy(games.scheduledAt);
}

export async function getGamesByStatus(status: "upcoming" | "live" | "completed") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(games).where(eq(games.status, status)).orderBy(games.scheduledAt);
}

export async function getGameById(gameId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGameByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(games).where(eq(games.externalId, externalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGame(game: InsertGame) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(games).values(game);
  return result;
}

export async function updateGameStatus(gameId: number, status: "upcoming" | "live" | "completed", winnerId?: number, homeScore?: number, awayScore?: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(games).set({ status, winnerId, homeScore, awayScore }).where(eq(games.id, gameId));
}

export async function updateGameOdds(gameId: number, homeOdds: number, awayOdds: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(games).set({ homeOdds, awayOdds }).where(eq(games.id, gameId));
}

// Wallet queries
export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createWallet(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(wallets).values({ userId, balance: 0 });
}

export async function updateWalletBalance(userId: number, newBalance: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.userId, userId));
}

// Transaction queries
export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(transactions).values(transaction);
}

export async function getTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
}

// Bet queries
export async function createBet(bet: InsertBet) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(bets).values(bet);
  return result;
}

export async function getBetsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt));
}

export async function getBetsByStatus(userId: number, status: "pending" | "won" | "lost") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).where(and(eq(bets.userId, userId), eq(bets.status, status))).orderBy(desc(bets.createdAt));
}

export async function getAllBets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).orderBy(desc(bets.createdAt));
}

export async function updateBetStatus(betId: number, status: "pending" | "won" | "lost") {
  const db = await getDb();
  if (!db) return;
  await db.update(bets).set({ status, settledAt: new Date() }).where(eq(bets.id, betId));
}

export async function getBetsByGameId(gameId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).where(eq(bets.gameId, gameId));
}

// Parlay leg queries
export async function createParlayLeg(leg: InsertParlayLeg) {
  const db = await getDb();
  if (!db) return;
  await db.insert(parlayLegs).values(leg);
}

export async function getParlayLegsByBetId(betId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(parlayLegs).where(eq(parlayLegs.betId, betId));
}

export async function updateParlayLegResult(legId: number, result: "pending" | "won" | "lost") {
  const db = await getDb();
  if (!db) return;
  await db.update(parlayLegs).set({ result }).where(eq(parlayLegs.id, legId));
}

export async function getParlayLegsByGameId(gameId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(parlayLegs).where(eq(parlayLegs.gameId, gameId));
}

export async function getTeamByName(fullName: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  // The Odds API returns full team names like "Green Bay Packers"
  // We need to match against city + name
  const result = await db.select().from(teams);
  
  // Find team by matching full name (city + name)
  const team = result.find(t => {
    const teamFullName = `${t.city} ${t.name}`;
    return teamFullName === fullName;
  });
  
  return team;
}

export async function updateGameOddsAndSpread(
  gameId: number,
  updates: {
    homeSpread?: number;
    awaySpread?: number;
    homeOdds?: number;
    awayOdds?: number;
    overUnder?: number;
    scheduledAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(games).set(updates).where(eq(games.id, gameId));
}


// Admin queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "user" | "agent" | "owner") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getAllWallets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wallets);
}

export async function setWalletBalance(userId: number, balance: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if wallet exists
  const existing = await getWalletByUserId(userId);
  if (existing) {
    await db.update(wallets).set({ balance }).where(eq(wallets.userId, userId));
  } else {
    await db.insert(wallets).values({ userId, balance });
  }
}

export async function adjustWalletBalance(userId: number, amount: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  
  const wallet = await getWalletByUserId(userId);
  if (!wallet) {
    // Create wallet if it doesn't exist
    await db.insert(wallets).values({ userId, balance: amount });
  } else {
    const newBalance = wallet.balance + amount;
    await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.userId, userId));
  }
  
  // Record transaction
  await createTransaction({
    userId,
    type: amount > 0 ? "deposit" : "withdrawal",
    amount: Math.abs(amount),
    balanceAfter: wallet ? wallet.balance + amount : amount,
    description: reason,
  });
}

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions);
}

export async function getUserBetHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).where(eq(bets.userId, userId));
}

// OAuth stub functions for backwards compatibility (deprecated)
export async function upsertUser(user: any): Promise<void> {
  console.warn("[Database] upsertUser is deprecated - OAuth is being phased out");
  return;
}

export async function getUserByOpenId(openId: string) {
  console.warn("[Database] getUserByOpenId is deprecated - OAuth is being phased out");
  return undefined;
}

export async function getGamesByTeams(homeTeamId: number, awayTeamId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(games).where(
    and(
      eq(games.homeTeamId, homeTeamId),
      eq(games.awayTeamId, awayTeamId)
    )
  );
}

export async function getUserBetsSince(userId: number, since: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bets).where(
    and(
      eq(bets.userId, userId),
      gte(bets.createdAt, since)
    )
  );
}

export async function updateUserLimits(
  userId: number,
  limits: {
    dailyLimit?: number | null;
    weeklyLimit?: number | null;
    perBetLimit?: number | null;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(limits).where(eq(users.id, userId));
}

export async function suspendUser(userId: number, suspended: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ suspended: suspended ? 1 : 0 }).where(eq(users.id, userId));
}
