import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Home, Trophy, Wallet, User, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/my-bets", label: "My Bets", icon: Trophy, protected: true },
    { path: "/wallet", label: "Wallet", icon: Wallet, protected: true },
    { path: "/stats", label: "Stats", icon: TrendingUp, protected: true },
    { path: "/profile", label: "Profile", icon: User, protected: true },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <a className="flex items-center gap-2 text-2xl font-bold gradient-text">
                🏆 WINZO
              </a>
            </Link>

            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}

              {(user?.role === "owner" || user?.role === "agent") && (
                <Link href="/admin">
                  <a
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                      location === "/admin"
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </a>
                </Link>
              )}

              {!isAuthenticated ? (
                <Button asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {user?.name || `@${user?.username}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            if (item.protected && !isAuthenticated) return null;
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
          
          {!isAuthenticated && (
            <a
              href={getLoginUrl()}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Sign In</span>
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
