import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, BookOpen, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState("");
  const [hoverRating, setHoverRating] = useState<number>(0);

  const workId = parseInt(id || "0");

  // Queries
  const { data: work, isLoading: workLoading } = trpc.works.getById.useQuery(
    { id: workId },
    { enabled: workId > 0 }
  );

  const { data: userRatingData } = trpc.ratings.getUserRating.useQuery(
    { workId },
    { enabled: isAuthenticated && workId > 0 }
  );

  const { data: reviews, refetch: refetchReviews } = trpc.reviews.getByWork.useQuery(
    { workId, limit: 20, offset: 0 },
    { enabled: workId > 0 }
  );

  // Mutations
  const ratingMutation = trpc.ratings.rate.useMutation({
    onSuccess: () => {
      toast.success("تم تقييم العمل بنجاح!");
    },
    onError: () => {
      toast.error("فشل التقييم. حاول مرة أخرى.");
    },
  });

  const reviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setReviewContent("");
      toast.success("تم إضافة التعليق بنجاح!");
      refetchReviews();
    },
    onError: () => {
      toast.error("فشل إضافة التعليق. حاول مرة أخرى.");
    },
  });

  const handleRating = async (score: number) => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setUserRating(score);
    await ratingMutation.mutateAsync({ workId, score });
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    if (!reviewContent.trim()) {
      toast.error("يجب كتابة تعليق");
      return;
    }

    await reviewMutation.mutateAsync({ workId, content: reviewContent });
  };

  if (workLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">العمل غير موجود</h1>
        <Link href="/">
          <Button>العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

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
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Cover & Info */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden sticky top-24">
              {/* Cover Image */}
              <div className="relative h-80 bg-muted">
                {work.coverImageUrl ? (
                  <img
                    src={work.coverImageUrl}
                    alt={work.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="mb-4 space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">النوع</p>
                    <p className="font-semibold">
                      {work.type === "manga" ? "مانجا" : "مانهوا"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">الحالة</p>
                    <p className="font-semibold">
                      {work.status === "ongoing"
                        ? "مستمر"
                        : work.status === "completed"
                          ? "مكتمل"
                          : "متوقف"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">عدد الفصول</p>
                    <p className="font-semibold">{work.chapters}</p>
                  </div>

                  {work.author && (
                    <div>
                      <p className="text-muted-foreground">المؤلف</p>
                      <p className="font-semibold">{work.author}</p>
                    </div>
                  )}

                  {work.genre && (
                    <div>
                      <p className="text-muted-foreground">الأنواع</p>
                      <p className="font-semibold">{work.genre}</p>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="border-t border-border pt-4 mb-4">
                  <p className="text-muted-foreground mb-2">التقييم العام</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(parseFloat(work.averageRating || "0"))
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{work.averageRating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({work.totalRatings} تقييم)
                    </span>
                  </div>
                </div>

                {/* Reading Links */}
                {work.readingLinks && work.readingLinks.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground mb-3 font-semibold">روابط القراءة</p>
                    <div className="space-y-2">
                      {work.readingLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Details & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Description */}
            <div>
              <h1 className="text-elegant-lg mb-4">{work.title}</h1>
              {work.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {work.description}
                </p>
              )}
            </div>

            {/* User Rating Section */}
            {isAuthenticated && (
              <Card className="p-6">
                <h2 className="text-elegant-md mb-4">قيّم هذا العمل</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={ratingMutation.isPending}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoverRating || userRatingData?.score || userRating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRatingData?.score && (
                    <span className="text-sm text-muted-foreground">
                      تقييمك: {userRatingData.score} نجوم
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Add Review Section */}
            {isAuthenticated && (
              <Card className="p-6">
                <h2 className="text-elegant-md mb-4">أضف تعليقك</h2>
                <div className="space-y-4">
                  <Textarea
                    placeholder="شارك رأيك حول هذا العمل..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="min-h-24"
                  />
                  <Button
                    onClick={handleReviewSubmit}
                    disabled={reviewMutation.isPending || !reviewContent.trim()}
                    className="w-full"
                  >
                    {reviewMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      "إرسال التعليق"
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <div>
              <h2 className="text-elegant-md mb-6">التعليقات ({reviews?.length || 0})</h2>
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold">مستخدم</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.content}</p>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد تعليقات حتى الآن. كن الأول في إضافة تعليق!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
