CREATE TYPE "public"."bet_status" AS ENUM('pending', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('upcoming', 'live', 'completed');--> statement-breakpoint
CREATE TYPE "public"."parlay_result" AS ENUM('pending', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'agent', 'owner');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_lost');--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "parlayLegs" (
	"id" serial PRIMARY KEY NOT NULL,
	"betId" integer NOT NULL,
	"gameId" integer NOT NULL,
	"selectedTeamId" integer NOT NULL,
	"odds" integer NOT NULL,
	"result" "parlay_result" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"icon" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_name_unique" UNIQUE("name"),
	CONSTRAINT "sports_code_unique" UNIQUE("code")
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balanceAfter" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_userId_unique" UNIQUE("userId")
);
