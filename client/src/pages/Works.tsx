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
import { Star, BookOpen, Search, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Works() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const { data: works, isLoading } = trpc.works.list.useQuery({
    limit: 20,
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
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="mb-12">
          <h1 className="text-elegant-lg mb-2">جميع الأعمال</h1>
          <p className="text-muted-foreground">
            استكشف مكتبة شاملة من المانجا والمانهوا
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن العنوان..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOffset(0);
                }}
              />
            </div>

            {/* Type Filter */}
            <Select value={type} onValueChange={(val) => {
              setType(val);
              setOffset(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="manga">مانجا</SelectItem>
                <SelectItem value="manhwa">مانهوا</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={status} onValueChange={(val) => {
              setStatus(val);
              setOffset(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ongoing">مستمر</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="hiatus">متوقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Works Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredWorks && filteredWorks.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredWorks.map((work) => (
                <Link key={work.id} href={`/work/${work.id}`}>
                  <Card className="card-hover overflow-hidden h-full">
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

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - 20))}
                disabled={offset === 0}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + 20)}
                disabled={!filteredWorks || filteredWorks.length < 20}
              >
                التالي
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لم يتم العثور على أعمال</p>
          </div>
        )}
      </div>
    </div>
  );
}
