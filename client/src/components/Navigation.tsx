import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, LogOut, LogIn } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="hidden sm:inline">MangaRate</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                الرئيسية
              </a>
            </Link>
            <Link href="/works">
              <a className={`text-sm font-medium transition-colors ${isActive("/works") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                الأعمال
              </a>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/profile">
                  <a className={`text-sm font-medium transition-colors ${isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    ملفي الشخصي
                  </a>
                </Link>

                {user?.role === "admin" && (
                  <Link href="/admin-login">
                    <a className={`text-sm font-medium transition-colors ${isActive("/admin-login") || isActive("/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      الإدارة
                    </a>
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  دخول
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <Link href="/">
              <a
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                الرئيسية
              </a>
            </Link>
            <Link href="/works">
              <a
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${isActive("/works") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                الأعمال
              </a>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/profile">
                  <a
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg transition-colors ${isActive("/profile") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    ملفي الشخصي
                  </a>
                </Link>

                {user?.role === "admin" && (
                  <Link href="/admin-login">
                    <a
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2 rounded-lg transition-colors ${isActive("/admin-login") || isActive("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      الإدارة
                    </a>
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full gap-2 justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <a href={getLoginUrl()} className="block">
                <Button size="sm" className="w-full gap-2 justify-center">
                  <LogIn className="h-4 w-4" />
                  دخول
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
