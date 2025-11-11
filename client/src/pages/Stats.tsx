import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Trophy, Target } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Stats() {
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.stats.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your betting statistics
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navigation />
      
      <div className="pt-20 md:pt-24 pb-8">
        <div className="container">
          <h1 className="text-4xl font-bold gradient-text mb-4">Betting Statistics</h1>
          <p className="text-muted-foreground">Track your performance and betting patterns</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !stats ? (
        <div className="container text-center py-20">
          <p className="text-muted-foreground">No statistics available</p>
        </div>
      ) : (
        <div className="container space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Bets</span>
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stats.totalBets}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.pendingBets} pending
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <Trophy className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.wonBets}W - {stats.lostBets}L
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Staked</span>
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold">
                ${(stats.totalStaked / 100).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                All time
              </div>
            </Card>

            <Card className={`p-6 ${stats.netProfit >= 0 ? "border-green-500/50" : "border-red-500/50"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                {stats.netProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className={`text-3xl font-bold ${stats.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.netProfit >= 0 ? "+" : ""}${(stats.netProfit / 100).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.netProfit >= 0 ? "Profit" : "Loss"}
              </div>
            </Card>
          </div>

          {/* Favorite Sport */}
          {stats.favoriteSport && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Favorite Sport</h3>
              <div className="flex items-center gap-3">
                <div className="text-4xl">🏆</div>
                <div>
                  <div className="text-2xl font-bold">{stats.favoriteSport}</div>
                  <div className="text-sm text-muted-foreground">Most bets placed</div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Activity Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 7 Days)</h3>
            <div className="space-y-3">
              {stats.recentActivity.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 bg-primary/20 rounded flex items-center justify-center px-3"
                        style={{ width: `${Math.max(10, (day.bets / Math.max(...stats.recentActivity.map(d => d.bets))) * 100)}%` }}
                      >
                        <span className="text-xs font-medium">{day.bets} bets</span>
                      </div>
                      {day.profit !== 0 && (
                        <span className={`text-xs font-medium ${day.profit > 0 ? "text-green-500" : "text-red-500"}`}>
                          {day.profit > 0 ? "+" : ""}${(day.profit / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sport Breakdown */}
          {stats.sportBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance by Sport</h3>
              <div className="space-y-4">
                {stats.sportBreakdown.map((sport, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{sport.sportName}</span>
                      <span className="text-sm text-muted-foreground">
                        {sport.bets} bets
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${sport.winRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{sport.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sport.won} wins • {sport.lost} losses
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Data State */}
          {stats.totalBets === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Betting History Yet</h3>
              <p className="text-muted-foreground mb-6">
                Place your first bet to start tracking your statistics
              </p>
              <Button asChild>
                <a href="/">Browse Games</a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
