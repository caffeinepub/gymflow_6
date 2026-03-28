import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, ShieldCheck } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "../hooks/useQueries";

interface HeaderProps {
  onStartSession: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
}

export function Header({
  onStartSession,
  onToggleAdmin,
  isAdminView,
}: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;
  const initials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : "GF";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2" data-ocid="header.link">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            GYMFLOW
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {["Dashboard", "Workouts", "Tracking", "Progress"].map((item) => (
            <button
              key={item}
              type="button"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              data-ocid={`header.${item.toLowerCase()}.link`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button
                  onClick={onToggleAdmin}
                  variant={isAdminView ? "default" : "outline"}
                  size="sm"
                  className={
                    isAdminView
                      ? "bg-lime font-semibold text-primary-foreground shadow-lime hover:bg-lime/90"
                      : "border-lime/40 text-lime hover:bg-lime/10 hover:text-lime gap-1.5"
                  }
                  data-ocid="header.admin.button"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isAdminView ? "Exit Admin" : "Admin"}
                </Button>
              )}
              <Button
                onClick={onStartSession}
                className="hidden bg-lime font-semibold text-primary-foreground shadow-lime hover:bg-lime/90 sm:flex"
                data-ocid="header.start_session.button"
              >
                Start Today's Session
              </Button>
              <button
                type="button"
                onClick={() => clear()}
                className="flex items-center gap-2"
                data-ocid="header.user.button"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-xs text-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </>
          ) : (
            <Button
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="bg-lime font-semibold text-primary-foreground hover:bg-lime/90"
              data-ocid="header.login.button"
            >
              {loginStatus === "logging-in" ? "Logging in..." : "Log In"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
