import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ScrollText, Gamepad2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span>GameQueue</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                  <span className="text-sm font-medium hidden sm:block text-muted-foreground">
                    {user.username}
                  </span>
                  {user.avatarUrl && (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="h-8 w-8 rounded-full ring-2 ring-border"
                    />
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <a href="/auth/discord">
                <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Login with Discord
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container px-4 sm:px-8 py-8 md:py-12 animate-in-up">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card/30 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 GameQueue. Built for gamers.</p>
        </div>
      </footer>
    </div>
  );
}
