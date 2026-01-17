import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, BookOpen, Search, ArrowLeft, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Isekai",
];

export default function Works() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);

  const { data: works, isLoading } = trpc.works.list.useQuery({
    limit: 100,
    offset,
  });

  const filteredWorks = works?.filter((work) => {
    if (type !== "all" && work.type !== type) return false;
    if (status !== "all" && work.status !== status) return false;
    if (
      searchQuery &&
      !work.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container px-4 md:px-0 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </a>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">جميع الأعمال</h1>
          <p className="text-muted-foreground">
            استكشف مكتبة شاملة من المانجا والمانهوا
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن عمل أو مؤلف..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOffset(0);
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex md:hidden items-center gap-2 text-sm font-medium mb-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
          </button>

          <div
            className={`grid gap-4 md:grid-cols-3 ${
              !showFilters && "hidden md:grid"
            }`}
          >
            {/* Type Filter */}
            <Select
              value={type}
              onValueChange={(val) => {
                setType(val);
                setOffset(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="manga">مانجا</SelectItem>
                <SelectItem value="manhwa">مانهوا</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setOffset(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ongoing">مستمر</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="hiatus">متوقف</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={() => {
                setType("all");
                setStatus("all");
                setSearchQuery("");
                setOffset(0);
              }}
              className="w-full"
            >
              إعادة تعيين
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          تم العثور على {filteredWorks?.length || 0} عمل
        </div>

        {/* Works Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 sm:h-48 rounded-lg bg-muted mb-3" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredWorks && filteredWorks.length > 0 ? (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredWorks.map((work) => (
                <Link key={work.id} href={`/work/${work.id}`}>
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

                        {/* Status */}
                        <div className="text-xs text-muted-foreground mt-2">
                          {work.status === "ongoing"
                            ? "مستمر"
                            : work.status === "completed"
                              ? "مكتمل"
                              : "متوقف"}
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-2 sm:gap-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - 20))}
                disabled={offset === 0}
                className="text-xs sm:text-sm"
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + 20)}
                disabled={!filteredWorks || filteredWorks.length < 20}
                className="text-xs sm:text-sm"
              >
                التالي
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">لم يتم العثور على أعمال</p>
            <Button
              variant="outline"
              onClick={() => {
                setType("all");
                setStatus("all");
                setSearchQuery("");
                setOffset(0);
              }}
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
