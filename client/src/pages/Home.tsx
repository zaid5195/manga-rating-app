import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Search, BookOpen, TrendingUp } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: works, isLoading } = trpc.works.list.useQuery({
    limit: 12,
    offset: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-elegant-lg text-primary">MangaRate</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  مرحباً، {user?.name || "المستخدم"}
                </span>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    ملفي الشخصي
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">دخول</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              اكتشف عالم المانجا والمانهوا
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              قيّم أعمالك المفضلة، اقرأ آراء المجتمع، واكتشف أعمالاً جديدة مذهلة
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن المانجا أو المانهوا..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                بحث
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-elegant-lg mb-2">الأعمال المشهورة</h2>
              <p className="text-muted-foreground">أعمال مانجا ومانهوا مختارة بعناية</p>
            </div>
            <Link href="/works">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                عرض الكل
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {works?.map((work) => (
                <Link key={work.id} href={`/work/${work.id}`}>
                  <Card className="card-hover overflow-hidden">
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {work.coverImageUrl ? (
                        <img
                          src={work.coverImageUrl}
                          alt={work.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {work.type === "manga" ? "مانجا" : "مانهوا"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-card-foreground">
                        {work.title}
                      </h3>
                      
                      {/* Rating */}
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(parseFloat(work.averageRating || "0"))
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {work.averageRating}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {work.status === "ongoing"
                            ? "مستمر"
                            : work.status === "completed"
                              ? "مكتمل"
                              : "متوقف"}
                        </span>
                        <span>{work.chapters} فصل</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container">
          <h2 className="text-elegant-lg mb-12 text-center">لماذا MangaRate؟</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-elegant-md mb-2">تقييمات دقيقة</h3>
              <p className="text-sm text-muted-foreground">
                قيّم أعمالك المفضلة بنظام نجوم شامل وشارك آرائك مع المجتمع
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-accent/10 p-3">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-elegant-md mb-2">روابط قراءة مباشرة</h3>
              <p className="text-sm text-muted-foreground">
                وصول سريع إلى منصات القراءة المختلفة من صفحة العمل مباشرة
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-3">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-elegant-md mb-2">اكتشف أعمالاً جديدة</h3>
              <p className="text-sm text-muted-foreground">
                استكشف أعمالاً موصى بها بناءً على تقييمات المجتمع والاتجاهات الحالية
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MangaRate. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
