import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Search, DollarSign, Users, TrendingUp, Shield } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceAction, setBalanceAction] = useState<"set" | "adjust">("set");
  const [adjustReason, setAdjustReason] = useState("");
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("");
  const [weeklyLimit, setWeeklyLimit] = useState("");
  const [perBetLimit, setPerBetLimit] = useState("");

  const { data: allUsers, isLoading: usersLoading } = trpc.admin.allUsers.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "owner" || user?.role === "agent"),
  });

  const { data: allWallets } = trpc.admin.allWallets.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "owner" || user?.role === "agent"),
  });

  const { data: allBets } = trpc.admin.allBets.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "owner" || user?.role === "agent"),
  });

  const { data: userDetails } = trpc.admin.userDetails.useQuery(
    { userId: selectedUser?.id },
    { enabled: !!selectedUser }
  );

  const utils = trpc.useUtils();

  const setBalance = trpc.admin.setBalance.useMutation({
    onSuccess: () => {
      toast.success("Balance updated successfully!");
      setShowWalletDialog(false);
      setBalanceAmount("");
      utils.admin.allWallets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const adjustBalance = trpc.admin.adjustBalance.useMutation({
    onSuccess: () => {
      toast.success("Balance adjusted successfully!");
      setShowWalletDialog(false);
      setBalanceAmount("");
      setAdjustReason("");
      utils.admin.allWallets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated!");
      utils.admin.allUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateLimits = trpc.admin.updateUserLimits.useMutation({
    onSuccess: () => {
      toast.success("Betting limits updated!");
      setShowLimitsDialog(false);
      utils.admin.allUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const suspendUser = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User suspension status updated!");
      utils.admin.allUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleWalletAction = () => {
    if (!selectedUser || !balanceAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      toast.error("Invalid amount");
      return;
    }

    if (balanceAction === "set") {
      setBalance.mutate({ userId: selectedUser.id, balance: amount });
    } else {
      if (!adjustReason.trim()) {
        toast.error("Please provide a reason");
        return;
      }
      adjustBalance.mutate({ userId: selectedUser.id, amount, reason: adjustReason });
    }
  };

  const openUserDialog = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const openWalletDialog = (user: any, action: "set" | "adjust") => {
    setSelectedUser(user);
    setBalanceAction(action);
    setBalanceAmount("");
    setAdjustReason("");
    setShowWalletDialog(true);
  };

  const openLimitsDialog = (user: any) => {
    setSelectedUser(user);
    setDailyLimit(user.dailyLimit?.toString() || "");
    setWeeklyLimit(user.weeklyLimit?.toString() || "");
    setPerBetLimit(user.perBetLimit?.toString() || "");
    setShowLimitsDialog(true);
  };

  const handleSuspendToggle = (user: any) => {
    if (confirm(`Are you sure you want to ${user.suspended ? 'unsuspend' : 'suspend'} ${user.name}?`)) {
      suspendUser.mutate({ userId: user.id, suspended: !user.suspended });
    }
  };

  const handleUpdateLimits = () => {
    if (!selectedUser) return;

    updateLimits.mutate({
      userId: selectedUser.id,
      dailyLimit: dailyLimit ? parseFloat(dailyLimit) : null,
      weeklyLimit: weeklyLimit ? parseFloat(weeklyLimit) : null,
      perBetLimit: perBetLimit ? parseFloat(perBetLimit) : null,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the admin panel
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  if (user?.role !== "owner" && user?.role !== "agent") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page
          </p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </Card>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalBalance = allWallets?.reduce((sum, w) => sum + w.balance, 0) || 0;
  const totalBets = allBets?.length || 0;
  const activePlayers = allUsers?.filter(u => u.role === "user").length || 0;

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage players, wallets, and monitor betting activity
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold">{activePlayers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold">{totalBets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <p className="text-2xl font-bold capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Player Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Player Management</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {usersLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading players...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Player</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-right py-3 px-4">Balance</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((player) => {
                    const wallet = allWallets?.find(w => w.userId === player.id);
                    return (
                      <tr key={player.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{player.name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">@{player.username}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            player.role === "owner" ? "bg-gold/20 text-gold" :
                            player.role === "agent" ? "bg-secondary/20 text-secondary-foreground" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {player.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ${(wallet?.balance || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUserDialog(player)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWalletDialog(player, "set")}
                            >
                              Set Balance
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWalletDialog(player, "adjust")}
                            >
                              Adjust
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openLimitsDialog(player)}
                            >
                              Limits
                            </Button>
                            <Button
                              size="sm"
                              variant={player.suspended ? "default" : "destructive"}
                              onClick={() => handleSuspendToggle(player)}
                            >
                              {player.suspended ? "Unsuspend" : "Suspend"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Player Details</DialogTitle>
            </DialogHeader>
            {userDetails && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{userDetails.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Username</p>
                      <p className="font-medium">@{userDetails.user?.username || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{userDetails.user?.role}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-medium">${(userDetails.wallet?.balance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {user?.role === "owner" && userDetails.user?.role !== "owner" && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newRole = userDetails.user?.role === "agent" ? "user" : "agent";
                          updateRole.mutate({ userId: userDetails.user!.id, role: newRole });
                        }}
                      >
                        {userDetails.user?.role === "agent" ? "Demote to User" : "Promote to Agent"}
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recent Bets ({userDetails.bets?.length || 0})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {userDetails.bets?.slice(0, 5).map((bet: any) => (
                      <div key={bet.id} className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span>Stake: ${bet.stake}</span>
                          <span className={`font-medium ${
                            bet.status === "won" ? "text-green-500" :
                            bet.status === "lost" ? "text-red-500" :
                            "text-yellow-500"
                          }`}>
                            {bet.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recent Transactions ({userDetails.transactions?.length || 0})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {userDetails.transactions?.slice(0, 5).map((tx: any) => (
                      <div key={tx.id} className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="capitalize">{tx.type}</span>
                          <span className="font-medium">${tx.amount.toFixed(2)}</span>
                        </div>
                        {tx.description && (
                          <p className="text-muted-foreground text-xs mt-1">{tx.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Wallet Management Dialog */}
        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {balanceAction === "set" ? "Set Balance" : "Adjust Balance"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Player</p>
                <p className="font-medium">{selectedUser?.name || "Unknown"}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {balanceAction === "set" ? "New Balance" : "Amount (+ or -)"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={balanceAction === "set" ? "100.00" : "+50.00 or -25.00"}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                />
              </div>

              {balanceAction === "adjust" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Reason</label>
                  <Input
                    placeholder="e.g., Bonus, Correction, etc."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleWalletAction} className="flex-1">
                  Confirm
                </Button>
                <Button variant="outline" onClick={() => setShowWalletDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Betting Limits Dialog */}
        <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Betting Limits for {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Daily Limit ($)</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum amount user can bet per day</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Weekly Limit ($)</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={weeklyLimit}
                  onChange={(e) => setWeeklyLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum amount user can bet per week</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Per-Bet Limit ($)</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={perBetLimit}
                  onChange={(e) => setPerBetLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum amount per single bet</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateLimits} className="flex-1">
                  Update Limits
                </Button>
                <Button variant="outline" onClick={() => setShowLimitsDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
