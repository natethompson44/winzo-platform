import { TRPCError } from "@trpc/server";
import * as db from "./db";

export async function checkBettingLimits(userId: number, stakeAmount: number): Promise<void> {
  const user = await db.getUserById(userId);
  
  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  // Check if user is suspended
  if (user.suspended) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Your betting privileges have been suspended. Please contact support." 
    });
  }

  // Check per-bet limit
  if (user.perBetLimit && stakeAmount > user.perBetLimit) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: `Bet amount exceeds your per-bet limit of $${user.perBetLimit}` 
    });
  }

  // Check daily limit
  if (user.dailyLimit) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBets = await db.getUserBetsSince(userId, today);
    const todayTotal = todayBets.reduce((sum, bet) => sum + bet.stake, 0);
    
    if (todayTotal + stakeAmount > user.dailyLimit) {
      const remaining = user.dailyLimit - todayTotal;
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: `This bet would exceed your daily limit of $${user.dailyLimit}. Remaining: $${remaining.toFixed(2)}` 
      });
    }
  }

  // Check weekly limit
  if (user.weeklyLimit) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekBets = await db.getUserBetsSince(userId, weekAgo);
    const weekTotal = weekBets.reduce((sum, bet) => sum + bet.stake, 0);
    
    if (weekTotal + stakeAmount > user.weeklyLimit) {
      const remaining = user.weeklyLimit - weekTotal;
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: `This bet would exceed your weekly limit of $${user.weeklyLimit}. Remaining: $${remaining.toFixed(2)}` 
      });
    }
  }
}
