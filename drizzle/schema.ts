import { integer, pgEnum, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

// Define enums first
export const roleEnum = pgEnum("role", ["user", "agent", "owner"]);
export const gameStatusEnum = pgEnum("game_status", ["upcoming", "live", "completed"]);
export const betStatusEnum = pgEnum("bet_status", ["pending", "won", "lost"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "bet_placed", "bet_won", "bet_lost"]);
export const parlayResultEnum = pgEnum("parlay_result", ["pending", "won", "lost"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: text("name"),
  role: roleEnum("role").notNull().default("user"),
  suspended: integer("suspended").default(0).notNull(), // 0 = active, 1 = suspended
  dailyLimit: integer("dailyLimit").default(0), // 0 = no limit
  weeklyLimit: integer("weeklyLimit").default(0), // 0 = no limit
  perBetLimit: integer("perBetLimit").default(0), // 0 = no limit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sports table - NFL, NBA, MLB, NHL
 */
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(), // NFL, NBA, MLB, NHL
  icon: text("icon"), // Icon or emoji representation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sport = typeof sports.$inferSelect;
export type InsertSport = typeof sports.$inferInsert;

/**
 * Teams table
 */
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  sportId: integer("sportId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  abbreviation: varchar("abbreviation", { length: 10 }),
  logo: text("logo"), // URL to team logo
  primaryColor: varchar("primaryColor", { length: 7 }), // Hex color
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Games table - matchups between teams
 */
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  sportId: integer("sportId").notNull(),
  homeTeamId: integer("homeTeamId").notNull(),
  awayTeamId: integer("awayTeamId").notNull(),
  homeOdds: integer("homeOdds").notNull(), // Stored as integer (e.g., 150 for +150, -150 for -150)
  awayOdds: integer("awayOdds").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: gameStatusEnum("status").notNull().default("upcoming"),
  homeScore: integer("homeScore"),
  awayScore: integer("awayScore"),
  winnerId: integer("winnerId"), // Team ID of winner
  externalId: varchar("externalId", { length: 255 }), // Odds API game ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

/**
 * Wallet table - user balances
 */
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  balance: integer("balance").default(0).notNull(), // Stored in cents to avoid decimal issues
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Transactions table - deposits and withdrawals
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // In cents
  balanceAfter: integer("balanceAfter").notNull(), // Balance after transaction in cents
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Bets table - user bets on games
 */
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  gameId: integer("gameId"), // Null for parlay bets
  selectedTeamId: integer("selectedTeamId"), // Null for parlay bets
  odds: integer("odds").notNull(), // Odds at time of bet placement
  stake: integer("stake").notNull(), // Amount bet in cents
  potentialPayout: integer("potentialPayout").notNull(), // Calculated payout in cents
  status: betStatusEnum("status").notNull().default("pending"),
  isParlay: boolean("isParlay").default(false).notNull(),
  settledAt: timestamp("settledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bet = typeof bets.$inferSelect;
export type InsertBet = typeof bets.$inferInsert;

/**
 * Parlay legs table - individual selections in a parlay bet
 */
export const parlayLegs = pgTable("parlayLegs", {
  id: serial("id").primaryKey(),
  betId: integer("betId").notNull(), // References bets.id
  gameId: integer("gameId").notNull(),
  selectedTeamId: integer("selectedTeamId").notNull(),
  odds: integer("odds").notNull(),
  result: parlayResultEnum("result").notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParlayLeg = typeof parlayLegs.$inferSelect;
export type InsertParlayLeg = typeof parlayLegs.$inferInsert;
