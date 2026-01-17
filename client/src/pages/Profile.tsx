import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ArrowLeft, LogOut, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: reviews, isLoading } = trpc.reviews.getUserReviews.useQuery(
    { limit: 20, offset: 0 },
    { enabled: isAuthenticated }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation("/");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">يجب تسجيل الدخول أولاً</h1>
        <a href={getLoginUrl()}>
          <Button>دخول</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        {/* Profile Header */}
        <Card className="mb-12 p-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-elegant-lg">{user?.name || "المستخدم"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.role === "admin" && (
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                    مسؤول
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Admin Panel Link */}
        {user?.role === "admin" && (
          <div className="mb-8">
            <Link href="/admin">
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" />
                لوحة تحكم الإدارة
              </Button>
            </Link>
          </div>
        )}

        {/* Reviews Section */}
        <div>
          <h2 className="text-elegant-lg mb-6">تعليقاتي ({reviews?.length || 0})</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-card-foreground">
                        العمل #{review.workId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                  {(review.helpful ?? 0) > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <Star className="inline h-3 w-3 mr-1" />
                      {review.helpful} أشخاص وجدوا هذا مفيداً
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لم تضف أي تعليقات حتى الآن</p>
              <Link href="/works">
                <Button variant="outline" className="mt-4">
                  استكشف الأعمال
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
