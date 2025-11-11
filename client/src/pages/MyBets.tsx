import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function MyBets() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "won" | "lost">("all");

  const { data: bets, isLoading } = trpc.bets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const filteredBets = bets?.filter((bet) => {
    if (filter === "all") return true;
    return bet.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your betting history
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
          <h1 className="text-4xl font-bold gradient-text mb-4">My Bets</h1>
          <p className="text-muted-foreground">Track your betting history and results</p>
        </div>
      </div>

      <div className="container">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Bets
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "won" ? "default" : "outline"}
            onClick={() => setFilter("won")}
          >
            Won
          </Button>
          <Button
            variant={filter === "lost" ? "default" : "outline"}
            onClick={() => setFilter("lost")}
          >
            Lost
          </Button>
        </div>

        {/* Bets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !filteredBets || filteredBets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No bets found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBets.map((bet) => (
              <Card key={bet.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant={
                          bet.status === "won"
                            ? "default"
                            : bet.status === "lost"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          bet.status === "won"
                            ? "bg-green-600"
                            : bet.status === "pending"
                            ? "bg-yellow-600"
                            : ""
                        }
                      >
                        {bet.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-lg">
                        {bet.selectedTeam?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bet.homeTeam?.name} vs {bet.awayTeam?.name}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Odds: <span className="text-primary font-medium">{formatOdds(bet.odds)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Stake: <span className="font-medium">${(bet.stake / 100).toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      {bet.status === "pending" ? "Potential Payout" : "Payout"}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${(bet.potentialPayout / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
