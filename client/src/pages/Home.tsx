import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Search, BookOpen, TrendingUp } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: works, isLoading } = trpc.works.list.useQuery({
    limit: 12,
    offset: 0,
  });

  const filteredWorks = works?.filter((work) =>
    work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    work.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container relative px-4 md:px-0">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl md:text-5xl font-bold leading-tight">
              اكتشف عالم المانجا والمانهوا
            </h2>
            <p className="mb-8 text-base md:text-lg text-muted-foreground">
              قيّم أعمالك المفضلة، اقرأ آراء المجتمع، واكتشف أعمالاً جديدة مذهلة
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن المانجا أو المانهوا..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href="/works">
                <Button className="gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">بحث</span>
                </Button>
              </Link>
            </div>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <a href={getLoginUrl()} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    دخول الآن
                  </Button>
                </a>
                <Link href="/works" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    استكشف الأعمال
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-0">
          <div className="mb-8 md:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">الأعمال المشهورة</h2>
              <p className="text-sm md:text-base text-muted-foreground">أعمال مانجا ومانهوا مختارة بعناية</p>
            </div>
            <Link href="/works">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <TrendingUp className="h-4 w-4" />
                عرض الكل
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 sm:h-48 rounded-lg bg-muted mb-3" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredWorks?.map((work) => (
                <Link key={work.id} href={`/work/${work.id.toString()}`}>
                  <a className="group block">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Cover Image */}
                      <div className="relative overflow-hidden bg-muted aspect-[2/3]">
                        {work.coverImageUrl ? (
                          <img
                            src={work.coverImageUrl}
                            alt={work.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                          {work.type === "manga" ? "مانجا" : "مانهوا"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {work.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {work.author || "مؤلف غير معروف"}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-semibold">
                            {parseFloat(work.averageRating || "0").toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({work.totalRatings})
                          </span>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-12 md:py-16">
        <div className="container px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">لماذا MangaRate؟</h2>
          
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">تقييمات دقيقة</h3>
              <p className="text-sm text-muted-foreground">
                قيّم أعمالك المفضلة بنظام نجوم شامل وشارك آرائك مع المجتمع
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-accent/10 p-3">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">روابط قراءة مباشرة</h3>
              <p className="text-sm text-muted-foreground">
                وصول سريع إلى منصات القراءة المختلفة من صفحة العمل مباشرة
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-block rounded-lg bg-secondary/10 p-3">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">اكتشف أعمالاً جديدة</h3>
              <p className="text-sm text-muted-foreground">
                استكشف أعمالاً موصى بها بناءً على تقييمات المجتمع والاتجاهات الحالية
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container px-4 md:px-0 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MangaRate. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
