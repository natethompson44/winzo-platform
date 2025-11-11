import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Trophy, TrendingUp, Shield, Zap } from "lucide-react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/stadium-bg.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src={APP_LOGO} 
            alt={APP_TITLE}
            className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
              {APP_TITLE}
            </span>
          </h1>
          <p className="text-center text-lg text-white/80 font-light tracking-wide">
            Where Champions Place Their Bets
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 hover:border-primary/50 transition-all duration-500">
            {/* Tagline */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Enter the Arena
              </h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Join thousands of winners betting on NFL, NBA, MLB, and NHL with premium odds and instant payouts
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Trophy className="w-8 h-8 text-secondary mb-2" />
                <span className="text-xs text-white/80 font-medium">Premium Odds</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Zap className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs text-white/80 font-medium">Instant Bets</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <TrendingUp className="w-8 h-8 text-secondary mb-2" />
                <span className="text-xs text-white/80 font-medium">Live Odds</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs text-white/80 font-medium">Secure</span>
              </div>
            </div>

            {/* CTA Button */}
            <a href={getLoginUrl()} className="block">
              <Button 
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In to Start Winning
              </Button>
            </a>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Encrypted</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <p className="text-center mt-6 text-sm text-white/50">
            By signing in, you agree to our terms and conditions
          </p>
        </div>

        {/* Floating Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl w-full animate-fade-in-delayed">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">$2.5M+</div>
            <div className="text-xs md:text-sm text-white/60">Paid Out</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
            <div className="text-xs md:text-sm text-white/60">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
            <div className="text-xs md:text-sm text-white/60">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
