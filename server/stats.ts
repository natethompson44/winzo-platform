import * as db from "./db";

export interface BettingStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate: number;
  totalStaked: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  favoriteSport: string | null;
  recentActivity: Array<{
    date: string;
    bets: number;
    profit: number;
  }>;
  sportBreakdown: Array<{
    sportName: string;
    bets: number;
    won: number;
    lost: number;
    winRate: number;
  }>;
}

export async function calculateUserStats(userId: number): Promise<BettingStats> {
  const allBets = await db.getBetsByUserId(userId);
  const sports = await db.getAllSports();
  
  const wonBets = allBets.filter((bet) => bet.status === "won");
  const lostBets = allBets.filter((bet) => bet.status === "lost");
  const pendingBets = allBets.filter((bet) => bet.status === "pending");
  
  const totalStaked = allBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWon = wonBets.reduce((sum, bet) => sum + bet.potentialPayout, 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + bet.stake, 0);
  const netProfit = totalWon - totalLost;
  
  const winRate = allBets.length > 0 
    ? (wonBets.length / (wonBets.length + lostBets.length)) * 100 
    : 0;
  
  // Calculate sport breakdown
  const sportBetsMap = new Map<number, any[]>();
  
  for (const bet of allBets) {
    if (!bet.gameId) continue; // Skip parlay bets for sport breakdown
    
    const game = await db.getGameById(bet.gameId);
    if (!game) continue;
    
    if (!sportBetsMap.has(game.sportId)) {
      sportBetsMap.set(game.sportId, []);
    }
    sportBetsMap.get(game.sportId)!.push(bet);
  }
  
  const sportBreakdown = [];
  let maxBets = 0;
  let favoriteSportName = null;
  
  for (const sport of sports) {
    const sportBets = sportBetsMap.get(sport.id) || [];
    const sportWon = sportBets.filter((bet) => bet.status === "won").length;
    const sportLost = sportBets.filter((bet) => bet.status === "lost").length;
    const sportWinRate = sportBets.length > 0 
      ? (sportWon / (sportWon + sportLost)) * 100 
      : 0;
    
    if (sportBets.length > 0) {
      sportBreakdown.push({
        sportName: sport.name,
        bets: sportBets.length,
        won: sportWon,
        lost: sportLost,
        winRate: sportWinRate,
      });
      
      if (sportBets.length > maxBets) {
        maxBets = sportBets.length;
        favoriteSportName = sport.name;
      }
    }
  }
  
  // Calculate recent activity (last 7 days)
  const recentActivity = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayBets = allBets.filter((bet) => {
      const betDate = new Date(bet.createdAt);
      return betDate >= date && betDate < nextDate;
    });
    
    const dayWon = dayBets.filter((bet) => bet.status === "won")
      .reduce((sum, bet) => sum + bet.potentialPayout, 0);
    const dayLost = dayBets.filter((bet) => bet.status === "lost")
      .reduce((sum, bet) => sum + bet.stake, 0);
    const dayProfit = dayWon - dayLost;
    
    recentActivity.push({
      date: date.toISOString().split("T")[0],
      bets: dayBets.length,
      profit: dayProfit,
    });
  }
  
  return {
    totalBets: allBets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    pendingBets: pendingBets.length,
    winRate: Math.round(winRate * 10) / 10,
    totalStaked,
    totalWon,
    totalLost,
    netProfit,
    favoriteSport: favoriteSportName,
    recentActivity,
    sportBreakdown,
  };
}
