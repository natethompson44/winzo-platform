import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BetSelection {
  gameId: number;
  teamId: number;
  teamName: string;
  odds: number;
  homeTeam: string;
  awayTeam: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(10);

  const { data: sports, isLoading: sportsLoading } = trpc.sports.list.useQuery();
  const { data: games, isLoading: gamesLoading } = trpc.games.list.useQuery();
  const { data: wallet } = trpc.wallet.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const placeBet = trpc.bets.place.useMutation({
    onSuccess: () => {
      toast.success("Bet placed successfully!");
      setBetSlip([]);
      utils.wallet.get.invalidate();
      utils.bets.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const placeParlay = trpc.bets.placeParlay.useMutation({
    onSuccess: () => {
      toast.success("Parlay bet placed successfully!");
      setBetSlip([]);
      utils.wallet.get.invalidate();
      utils.bets.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredGames = useMemo(() => {
    if (!games) return [];
    if (!selectedSport) return games;
    return games.filter((game) => game.sportId === selectedSport);
  }, [games, selectedSport]);

  const upcomingGames = useMemo(() => {
    const now = new Date();
    return filteredGames.filter((game) => {
      // Only show games that are upcoming AND haven't started yet
      const gameTime = new Date(game.scheduledAt);
      return game.status === "upcoming" && gameTime > now;
    });
  }, [filteredGames]);

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const calculateParlayOdds = () => {
    if (betSlip.length === 0) return 0;
    
    let combinedDecimalOdds = 1;
    for (const bet of betSlip) {
      const decimalOdds = bet.odds > 0 
        ? (bet.odds / 100) + 1 
        : (100 / Math.abs(bet.odds)) + 1;
      combinedDecimalOdds *= decimalOdds;
    }
    
    // Convert back to American odds
    const americanOdds = combinedDecimalOdds >= 2
      ? Math.round((combinedDecimalOdds - 1) * 100)
      : Math.round(-100 / (combinedDecimalOdds - 1));
    
    return americanOdds;
  };

  const calculatePotentialPayout = () => {
    if (betSlip.length === 0) return 0;
    
    if (betSlip.length === 1) {
      // Single bet
      const bet = betSlip[0];
      if (bet.odds > 0) {
        return stake + Math.floor((stake * bet.odds) / 100);
      } else {
        return stake + Math.floor((stake * 100) / Math.abs(bet.odds));
      }
    } else {
      // Parlay bet
      const parlayOdds = calculateParlayOdds();
      if (parlayOdds > 0) {
        return stake + Math.floor((stake * parlayOdds) / 100);
      } else {
        return stake + Math.floor((stake * 100) / Math.abs(parlayOdds));
      }
    }
  };

  const toggleTeamSelection = (
    gameId: number,
    teamId: number,
    teamName: string,
    odds: number,
    homeTeam: string,
    awayTeam: string
  ) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place bets");
      return;
    }

    const existingBetIndex = betSlip.findIndex((bet) => bet.gameId === gameId);
    
    if (existingBetIndex >= 0) {
      if (betSlip[existingBetIndex].teamId === teamId) {
        // Remove bet
        setBetSlip(betSlip.filter((_, i) => i !== existingBetIndex));
      } else {
        // Switch team
        const newBetSlip = [...betSlip];
        newBetSlip[existingBetIndex] = { gameId, teamId, teamName, odds, homeTeam, awayTeam };
        setBetSlip(newBetSlip);
      }
    } else {
      // Add bet
      setBetSlip([...betSlip, { gameId, teamId, teamName, odds, homeTeam, awayTeam }]);
    }
  };

  const removeBetFromSlip = (gameId: number) => {
    setBetSlip(betSlip.filter((bet) => bet.gameId !== gameId));
  };

  const handlePlaceBet = () => {
    if (betSlip.length === 0) return;
    
    if (betSlip.length === 1) {
      // Single bet
      const bet = betSlip[0];
      placeBet.mutate({
        gameId: bet.gameId,
        selectedTeamId: bet.teamId,
        stake: stake * 100, // Convert to cents
      });
    } else {
      // Parlay bet
      placeParlay.mutate({
        selections: betSlip.map((bet) => ({
          gameId: bet.gameId,
          selectedTeamId: bet.teamId,
          odds: bet.odds,
        })),
        stake: stake * 100, // Convert to cents
      });
    }
  };

  const isTeamSelected = (gameId: number, teamId: number) => {
    return betSlip.some((bet) => bet.gameId === gameId && bet.teamId === teamId);
  };

  const isPending = placeBet.isPending || placeParlay.isPending;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-20 md:pt-24 pb-8 bg-gradient-to-b from-card to-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Premium Sports Betting
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Experience the thrill of American sports betting with elegant design and effortless navigation.
          </p>
          
          {isAuthenticated && wallet && (
            <div className="mt-6 inline-flex items-center gap-3 bg-card px-6 py-3 rounded-xl border border-border">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="text-2xl font-bold text-primary">
                ${(wallet.balance / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sports Filter */}
      <div className="container py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Button
            variant={selectedSport === null ? "default" : "outline"}
            onClick={() => setSelectedSport(null)}
            className="whitespace-nowrap"
          >
            All Sports
          </Button>
          {sports?.map((sport) => (
            <Button
              key={sport.id}
              variant={selectedSport === sport.id ? "default" : "outline"}
              onClick={() => setSelectedSport(sport.id)}
              className="whitespace-nowrap"
            >
              {sport.icon} {sport.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="container">
        {gamesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : upcomingGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No upcoming games available</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {upcomingGames.map((game) => (
              <Card key={game.id} className="p-6 hover:border-primary/50 transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Game Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {new Date(game.scheduledAt).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(game.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.homeTeam?.logo && (
                            <img 
                              src={game.homeTeam.logo} 
                              alt={game.homeTeam.name}
                              className="w-10 h-10 object-contain"
                            />
                          )}
                          <span className="text-lg font-semibold">{game.homeTeam?.name}</span>
                        </div>
                        <Button
                          variant={isTeamSelected(game.id, game.homeTeamId) ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleTeamSelection(
                              game.id,
                              game.homeTeamId,
                              game.homeTeam?.name || "",
                              game.homeOdds,
                              game.homeTeam?.name || "",
                              game.awayTeam?.name || ""
                            )
                          }
                          className="min-w-[80px]"
                        >
                          {formatOdds(game.homeOdds)}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.awayTeam?.logo && (
                            <img 
                              src={game.awayTeam.logo} 
                              alt={game.awayTeam.name}
                              className="w-10 h-10 object-contain"
                            />
                          )}
                          <span className="text-lg font-semibold">{game.awayTeam?.name}</span>
                        </div>
                        <Button
                          variant={isTeamSelected(game.id, game.awayTeamId) ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleTeamSelection(
                              game.id,
                              game.awayTeamId,
                              game.awayTeam?.name || "",
                              game.awayOdds,
                              game.homeTeam?.name || "",
                              game.awayTeam?.name || ""
                            )
                          }
                          className="min-w-[80px]"
                        >
                          {formatOdds(game.awayOdds)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bet Slip */}
      {betSlip.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
          <Card className="w-80 p-4 shadow-2xl border-primary animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {betSlip.length === 1 ? "Single Bet" : `Parlay (${betSlip.length} legs)`}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBetSlip([])}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {betSlip.map((bet, index) => (
                <div key={index} className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded-lg">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{bet.teamName}</div>
                    <div className="text-xs text-muted-foreground">
                      {bet.homeTeam} vs {bet.awayTeam}
                    </div>
                    <div className="text-xs text-primary">{formatOdds(bet.odds)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeBetFromSlip(bet.gameId)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {betSlip.length > 1 && (
              <div className="mb-3 p-2 bg-secondary/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Combined Parlay Odds:</div>
                <div className="text-lg font-bold text-secondary">
                  {formatOdds(calculateParlayOdds())}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Stake ($)</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  min="1"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-bold text-primary">
                  ${(calculatePotentialPayout() / 100).toFixed(2)}
                </span>
              </div>

              <Button
                className="w-full"
                onClick={handlePlaceBet}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Bet...
                  </>
                ) : (
                  `Place ${betSlip.length === 1 ? "Bet" : "Parlay"}`
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
