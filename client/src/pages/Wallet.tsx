import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Wallet() {
  const { isAuthenticated } = useAuth();
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const { data: wallet, isLoading: walletLoading } = trpc.wallet.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.transactions.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const utils = trpc.useUtils();

  const deposit = trpc.wallet.deposit.useMutation({
    onSuccess: () => {
      toast.success("Deposit successful!");
      setShowDepositDialog(false);
      utils.wallet.get.invalidate();
      utils.wallet.transactions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const withdraw = trpc.wallet.withdraw.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal successful!");
      setShowWithdrawDialog(false);
      utils.wallet.get.invalidate();
      utils.wallet.transactions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeposit = () => {
    if (depositAmount < 1) {
      toast.error("Minimum deposit is $1");
      return;
    }
    deposit.mutate({ amount: depositAmount * 100 });
  };

  const handleWithdraw = () => {
    if (withdrawAmount < 1) {
      toast.error("Minimum withdrawal is $1");
      return;
    }
    withdraw.mutate({ amount: withdrawAmount * 100 });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case "withdrawal":
        return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
      case "bet_placed":
        return <ArrowUpCircle className="w-5 h-5 text-orange-500" />;
      case "bet_won":
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case "bet_lost":
        return <span className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "bet_placed":
        return "Bet Placed";
      case "bet_won":
        return "Bet Won";
      case "bet_lost":
        return "Bet Lost";
      default:
        return type;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your wallet
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
          <h1 className="text-4xl font-bold gradient-text mb-4">Wallet</h1>
          <p className="text-muted-foreground">Manage your balance and transactions</p>
        </div>
      </div>

      <div className="container">
        {/* Balance Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-card to-muted">
          {walletLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                <p className="text-5xl font-bold gradient-text">
                  ${((wallet?.balance || 0) / 100).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowDepositDialog(true)}
                  className="flex-1 max-w-xs"
                >
                  <ArrowDownCircle className="w-5 h-5 mr-2" />
                  Deposit
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowWithdrawDialog(true)}
                  className="flex-1 max-w-xs"
                >
                  <ArrowUpCircle className="w-5 h-5 mr-2" />
                  Withdraw
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>

          {transactionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium">
                          {getTransactionLabel(transaction.type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${
                          transaction.amount > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        ${(Math.abs(transaction.amount) / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: ${(transaction.balanceAfter / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add funds to your WINZO wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground">Amount ($)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg"
                min="1"
              />
            </div>

            <div className="flex gap-2">
              {[50, 100, 250, 500].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleDeposit}
              disabled={deposit.isPending}
            >
              {deposit.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Deposit $${depositAmount}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw funds from your WINZO wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground">Amount ($)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg"
                min="1"
                max={(wallet?.balance || 0) / 100}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Available: ${((wallet?.balance || 0) / 100).toFixed(2)}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleWithdraw}
              disabled={withdraw.isPending}
            >
              {withdraw.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Withdraw $${withdrawAmount}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
