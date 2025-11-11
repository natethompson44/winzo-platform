import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      window.location.href = "/";
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your profile
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
          <h1 className="text-4xl font-bold gradient-text mb-4">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <div className="container max-w-2xl">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                {user?.role === "owner" && (
                  <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-gold text-black rounded-full">
                    Owner
                  </span>
                )}
                {user?.role === "agent" && (
                  <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                    Agent
                  </span>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="w-5 h-5" />
                <span>@{user?.username}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>
                  Member since {new Date(user?.createdAt || "").toLocaleDateString()}
                </span>
              </div>


            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-border">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
