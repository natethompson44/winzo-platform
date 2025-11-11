import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, ownerProcedure } from "./_core/trpc";
import { calculateUserStats } from "./stats";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to calculate payout based on odds
function calculatePayout(stake: number, odds: number): number {
  if (odds > 0) {
    // Positive odds: profit = stake * (odds / 100)
    return stake + Math.floor((stake * odds) / 100);
  } else {
    // Negative odds: profit = stake / (abs(odds) / 100)
    return stake + Math.floor((stake * 100) / Math.abs(odds));
  }
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  sports: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSports();
    }),
  }),

  teams: router({
    bySport: publicProcedure
      .input(z.object({ sportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamsBySport(input.sportId);
      }),
  }),

  games: router({
    list: publicProcedure.query(async () => {
      const games = await db.getAllGames();
      const gamesWithTeams = await Promise.all(
        games.map(async (game) => {
          const homeTeam = await db.getTeamById(game.homeTeamId);
          const awayTeam = await db.getTeamById(game.awayTeamId);
          return { ...game, homeTeam, awayTeam };
        })
      );
      return gamesWithTeams;
    }),

    bySport: publicProcedure
      .input(z.object({ sportId: z.number() }))
      .query(async ({ input }) => {
        const games = await db.getGamesBySport(input.sportId);
        const gamesWithTeams = await Promise.all(
          games.map(async (game) => {
            const homeTeam = await db.getTeamById(game.homeTeamId);
            const awayTeam = await db.getTeamById(game.awayTeamId);
            return { ...game, homeTeam, awayTeam };
          })
        );
        return gamesWithTeams;
      }),

    byStatus: publicProcedure
      .input(z.object({ status: z.enum(["upcoming", "live", "completed"]) }))
      .query(async ({ input }) => {
        const games = await db.getGamesByStatus(input.status);
        const gamesWithTeams = await Promise.all(
          games.map(async (game) => {
            const homeTeam = await db.getTeamById(game.homeTeamId);
            const awayTeam = await db.getTeamById(game.awayTeamId);
            return { ...game, homeTeam, awayTeam };
          })
        );
        return gamesWithTeams;
      }),
  }),

  wallet: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let wallet = await db.getWalletByUserId(ctx.user.id);
      if (!wallet) {
        await db.createWallet(ctx.user.id);
        wallet = await db.getWalletByUserId(ctx.user.id);
      }
      return wallet;
    }),

    deposit: protectedProcedure
      .input(z.object({ amount: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        let wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet) {
          await db.createWallet(ctx.user.id);
          wallet = await db.getWalletByUserId(ctx.user.id);
        }
        
        const newBalance = (wallet?.balance || 0) + input.amount;
        await db.updateWalletBalance(ctx.user.id, newBalance);
        await db.createTransaction({
          userId: ctx.user.id,
          type: "deposit",
          amount: input.amount,
          balanceAfter: newBalance,
          description: "Deposit",
        });

        return { success: true, newBalance };
      }),

    withdraw: protectedProcedure
      .input(z.object({ amount: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Wallet not found" });
        }

        if (wallet.balance < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        const newBalance = wallet.balance - input.amount;
        await db.updateWalletBalance(ctx.user.id, newBalance);
        await db.createTransaction({
          userId: ctx.user.id,
          type: "withdrawal",
          amount: input.amount,
          balanceAfter: newBalance,
          description: "Withdrawal",
        });

        return { success: true, newBalance };
      }),

    transactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTransactionsByUserId(ctx.user.id);
    }),
  }),

  bets: router({
    place: protectedProcedure
      .input(z.object({
        gameId: z.number(),
        selectedTeamId: z.number(),
        stake: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check betting limits and suspension
        const { checkBettingLimits } = await import("./bettingLimits");
        await checkBettingLimits(ctx.user.id, input.stake);

        // Check wallet balance
        const wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet || wallet.balance < input.stake) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Get game and verify it's upcoming
        const game = await db.getGameById(input.gameId);
        if (!game) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
        }
        if (game.status !== "upcoming") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot bet on this game" });
        }
        
        // Check if game has already started
        const now = new Date();
        const gameTime = new Date(game.scheduledAt);
        if (gameTime <= now) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Game has already started" });
        }

        // Determine odds
        const odds = input.selectedTeamId === game.homeTeamId ? game.homeOdds : game.awayOdds;
        const potentialPayout = calculatePayout(input.stake, odds);

        // Deduct from wallet
        const newBalance = wallet.balance - input.stake;
        await db.updateWalletBalance(ctx.user.id, newBalance);
        await db.createTransaction({
          userId: ctx.user.id,
          type: "bet_placed",
          amount: -input.stake,
          balanceAfter: newBalance,
          description: `Bet on game #${input.gameId}`,
        });

        // Create bet
        await db.createBet({
          userId: ctx.user.id,
          gameId: input.gameId,
          selectedTeamId: input.selectedTeamId,
          odds,
          stake: input.stake,
          potentialPayout,
          status: "pending",
        });

        return { success: true, potentialPayout };
      }),

    placeParlay: protectedProcedure
      .input(z.object({
        selections: z.array(z.object({
          gameId: z.number(),
          selectedTeamId: z.number(),
          odds: z.number(),
        })).min(2),
        stake: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check betting limits and suspension
        const { checkBettingLimits } = await import("./bettingLimits");
        await checkBettingLimits(ctx.user.id, input.stake);

        // Check wallet balance
        const wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet || wallet.balance < input.stake) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Verify all games are upcoming and haven't started
        const now = new Date();
        for (const selection of input.selections) {
          const game = await db.getGameById(selection.gameId);
          if (!game) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Game ${selection.gameId} not found` });
          }
          if (game.status !== "upcoming") {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot bet on game ${selection.gameId}` });
          }
          
          // Check if game has already started
          const gameTime = new Date(game.scheduledAt);
          if (gameTime <= now) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Game has already started` });
          }
        }

        // Calculate parlay odds (multiply decimal odds)
        let combinedDecimalOdds = 1;
        for (const selection of input.selections) {
          const decimalOdds = selection.odds > 0 
            ? (selection.odds / 100) + 1 
            : (100 / Math.abs(selection.odds)) + 1;
          combinedDecimalOdds *= decimalOdds;
        }
        
        // Convert back to American odds
        const combinedAmericanOdds = combinedDecimalOdds >= 2
          ? Math.round((combinedDecimalOdds - 1) * 100)
          : Math.round(-100 / (combinedDecimalOdds - 1));
        
        const potentialPayout = calculatePayout(input.stake, combinedAmericanOdds);

        // Deduct from wallet
        const newBalance = wallet.balance - input.stake;
        await db.updateWalletBalance(ctx.user.id, newBalance);
        await db.createTransaction({
          userId: ctx.user.id,
          type: "bet_placed",
          amount: -input.stake,
          balanceAfter: newBalance,
          description: `Parlay bet (${input.selections.length} legs)`,
        });

        // Create parlay bet
        const betResult = await db.createBet({
          userId: ctx.user.id,
          gameId: null,
          selectedTeamId: null,
          odds: combinedAmericanOdds,
          stake: input.stake,
          potentialPayout,
          status: "pending",
          isParlay: true,
        });

        // Get the bet ID from the result
        if (!betResult || !betResult[0]) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create bet" });
        }
        const betId = betResult[0].insertId;

        // Create parlay legs
        for (const selection of input.selections) {
          await db.createParlayLeg({
            betId,
            gameId: selection.gameId,
            selectedTeamId: selection.selectedTeamId,
            odds: selection.odds,
            result: "pending",
          });
        }

        return { success: true, potentialPayout, combinedOdds: combinedAmericanOdds };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const userBets = await db.getBetsByUserId(ctx.user.id);
      const betsWithDetails = await Promise.all(
        userBets.map(async (bet) => {
          const game = bet.gameId ? await db.getGameById(bet.gameId) : undefined;
          const homeTeam = game ? await db.getTeamById(game.homeTeamId) : undefined;
          const awayTeam = game ? await db.getTeamById(game.awayTeamId) : undefined;
          const selectedTeam = bet.selectedTeamId ? await db.getTeamById(bet.selectedTeamId) : undefined;
          
          // For parlay bets, fetch parlay legs
          const parlayLegs = bet.isParlay ? await db.getParlayLegsByBetId(bet.id) : [];
          
          return { ...bet, game, homeTeam, awayTeam, selectedTeam, parlayLegs };
        })
      );
      return betsWithDetails;
    }),

    byStatus: protectedProcedure
      .input(z.object({ status: z.enum(["pending", "won", "lost"]) }))
      .query(async ({ ctx, input }) => {
        const userBets = await db.getBetsByStatus(ctx.user.id, input.status);
        const betsWithDetails = await Promise.all(
          userBets.map(async (bet) => {
            const game = bet.gameId ? await db.getGameById(bet.gameId) : undefined;
            const homeTeam = game ? await db.getTeamById(game.homeTeamId) : undefined;
            const awayTeam = game ? await db.getTeamById(game.awayTeamId) : undefined;
            const selectedTeam = bet.selectedTeamId ? await db.getTeamById(bet.selectedTeamId) : undefined;
            return { ...bet, game, homeTeam, awayTeam, selectedTeam };
          })
        );
        return betsWithDetails;
      }),
  }),

  stats: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await calculateUserStats(ctx.user.id);
    }),
  }),

  admin: router({
    updateGameStatus: protectedProcedure
      .input(z.object({
        gameId: z.number(),
        status: z.enum(["upcoming", "live", "completed"]),
        winnerId: z.number().optional(),
        homeScore: z.number().optional(),
        awayScore: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "agent") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        await db.updateGameStatus(input.gameId, input.status, input.winnerId, input.homeScore, input.awayScore);

        // If game is completed, settle bets
        if (input.status === "completed" && input.winnerId) {
          const gameBets = await db.getBetsByGameId(input.gameId);
          
          for (const bet of gameBets) {
            if (bet.selectedTeamId === input.winnerId) {
              // Won bet
              await db.updateBetStatus(bet.id, "won");
              
              // Add winnings to wallet
              const wallet = await db.getWalletByUserId(bet.userId);
              if (wallet) {
                const newBalance = wallet.balance + bet.potentialPayout;
                await db.updateWalletBalance(bet.userId, newBalance);
                await db.createTransaction({
                  userId: bet.userId,
                  type: "bet_won",
                  amount: bet.potentialPayout,
                  balanceAfter: newBalance,
                  description: `Won bet on game #${input.gameId}`,
                });
              }
            } else {
              // Lost bet
              await db.updateBetStatus(bet.id, "lost");
              
              const wallet = await db.getWalletByUserId(bet.userId);
              if (wallet) {
                await db.createTransaction({
                  userId: bet.userId,
                  type: "bet_lost",
                  amount: 0,
                  balanceAfter: wallet.balance,
                  description: `Lost bet on game #${input.gameId}`,
                });
              }
            }
          }
        }

        return { success: true };
      }),

    allBets: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "owner" && ctx.user.role !== "agent") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const allBets = await db.getAllBets();
      const betsWithDetails = await Promise.all(
        allBets.map(async (bet) => {
          const game = bet.gameId ? await db.getGameById(bet.gameId) : undefined;
          const selectedTeam = bet.selectedTeamId ? await db.getTeamById(bet.selectedTeamId) : undefined;
          return { ...bet, game, selectedTeam };
        })
      );
      return betsWithDetails;
    }),

    // User Management
    allUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    userDetails: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        const wallet = await db.getWalletByUserId(input.userId);
        const bets = await db.getUserBetHistory(input.userId);
        const transactions = await db.getTransactionsByUserId(input.userId);
        
        return {
          user,
          wallet,
          bets,
          transactions,
        };
      }),

    updateUserRole: ownerProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "agent", "owner"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    createUser: adminProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        name: z.string(),
        role: z.enum(["user", "agent", "owner"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createUser } = await import("./auth");
        await createUser(input.username, input.password, input.name, input.role);
        return { success: true };
      }),

    updateUserLimits: adminProcedure
      .input(z.object({
        userId: z.number(),
        dailyLimit: z.number().nullable().optional(),
        weeklyLimit: z.number().nullable().optional(),
        perBetLimit: z.number().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { userId, ...limits } = input;
        await db.updateUserLimits(userId, limits);
        return { success: true };
      }),

    suspendUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        suspended: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.suspendUser(input.userId, input.suspended);
        return { success: true };
      }),

    // Wallet Management
    allWallets: adminProcedure.query(async () => {
      const wallets = await db.getAllWallets();
      const users = await db.getAllUsers();
      
      // Join wallets with user info
      return wallets.map(wallet => {
        const user = users.find(u => u.id === wallet.userId);
        return {
          ...wallet,
          userName: user?.name || "Unknown",
          username: user?.username,
        };
      });
    }),

    setBalance: adminProcedure
      .input(z.object({
        userId: z.number(),
        balance: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await db.setWalletBalance(input.userId, input.balance);
        return { success: true };
      }),

    adjustBalance: adminProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.adjustWalletBalance(input.userId, input.amount, input.reason);
        return { success: true };
      }),

    // Activity Monitoring
    allTransactions: adminProcedure.query(async () => {
      return await db.getAllTransactions();
    }),
  }),
});

export type AppRouter = typeof appRouter;
