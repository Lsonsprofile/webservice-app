import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SearchPalette } from "./SearchPalette";
import { Breadcrumbs } from "./Breadcrumbs";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer + scroll to top on navigation
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="w-80 max-w-[85vw] border-sidebar-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div
            className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6"
            style={{
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1rem, env(safe-area-inset-right))",
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>

            <div className="min-w-0 flex-1">
              <Breadcrumbs />
            </div>

            <SearchPalette />

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" aria-hidden />
              ) : (
                <Moon className="h-5 w-5" aria-hidden />
              )}
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Avatar className="h-9 w-9">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                        {(user.name ?? user.email ?? "?")
                          .slice(0, 1)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block truncate font-medium">
                      {user.name ?? "Learner"}
                    </span>
                    {user.email ? (
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4" aria-hidden />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="h-10 px-4">
                <Link to="/login">
                  <UserRound className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
          style={{
            paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
          }}
        >
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
