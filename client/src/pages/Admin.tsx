import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, LogOut, Link as LinkIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// أنواع المانجا والمانهوا الشاملة
const MANGA_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "School",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Tragedy",
  "Isekai",
  "Harem",
  "Shounen",
  "Shoujo",
  "Seinen",
  "Josei",
  "Mecha",
  "Military",
  "Police",
  "Martial Arts",
  "Magic",
  "Vampire",
  "Demon",
  "Angels",
  "Aliens",
  "Monsters",
  "Time Travel",
  "Reincarnation",
  "Game",
  "Cooking",
  "Music",
  "Art",
  "Shounen Ai",
  "Yaoi",
  "Shoujo Ai",
  "Yuri",
];

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    // التحقق من حالة المصادقة من sessionStorage
    const authenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    setIsAdminAuthenticated(authenticated);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/admin-login");
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "manga" as const,
    status: "ongoing" as const,
    chapters: 0,
    author: "",
    genre: "",
    coverImageUrl: "",
  });

  const [readingLinkForm, setReadingLinkForm] = useState({
    workId: "",
    platform: "",
    url: "",
  });

  const { data: works, refetch: refetchWorks } = trpc.works.list.useQuery(
    { limit: 100, offset: 0 }
  );

  const createMutation = trpc.works.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العمل بنجاح!");
      setFormData({
        title: "",
        description: "",
        type: "manga",
        status: "ongoing",
        chapters: 0,
        author: "",
        genre: "",
        coverImageUrl: "",
      });
      setSelectedGenres([]);
      setShowForm(false);
      refetchWorks();
    },
    onError: () => {
      toast.error("فشل إضافة العمل");
    },
  });

  const updateMutation = trpc.works.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث العمل بنجاح!");
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        type: "manga",
        status: "ongoing",
        chapters: 0,
        author: "",
        genre: "",
        coverImageUrl: "",
      });
      setSelectedGenres([]);
      setShowForm(false);
      refetchWorks();
    },
    onError: () => {
      toast.error("فشل تحديث العمل");
    },
  });

  const deleteMutation = trpc.works.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العمل بنجاح!");
      refetchWorks();
    },
    onError: () => {
      toast.error("فشل حذف العمل");
    },
  });

  const addReadingLinkMutation = trpc.readingLinks.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة رابط القراءة بنجاح!");
      setReadingLinkForm({ workId: "", platform: "", url: "" });
      refetchWorks();
    },
    onError: () => {
      toast.error("فشل إضافة رابط القراءة");
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">لا توجد صلاحيات كافية</h1>
        <Link href="/">
          <Button>العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">يجب إدخال كلمة السر</h1>
        <Link href="/admin-login">
          <Button>الذهاب لصفحة تسجيل الدخول</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("يجب إدخال العنوان");
      return;
    }

    const genreString = selectedGenres.join(",");

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
        genre: genreString,
      });
    } else {
      await createMutation.mutateAsync({
        ...formData,
        genre: genreString,
      });
    }
  };

  const handleEdit = (work: any) => {
    setFormData({
      title: work.title,
      description: work.description || "",
      type: work.type,
      status: work.status,
      chapters: work.chapters,
      author: work.author || "",
      genre: work.genre || "",
      coverImageUrl: work.coverImageUrl || "",
    });
    setSelectedGenres(work.genre ? work.genre.split(",") : []);
    setEditingId(work.id);
    setShowForm(true);
  };

  const handleAddReadingLink = async () => {
    if (!readingLinkForm.workId || !readingLinkForm.platform || !readingLinkForm.url) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    await addReadingLinkMutation.mutateAsync({
      workId: parseInt(readingLinkForm.workId),
      platform: readingLinkForm.platform,
      url: readingLinkForm.url,
    });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

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
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-elegant-lg">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">إدارة الأعمال والمحتوى والروابط</p>
        </div>

        <Tabs defaultValue="works" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="works">إدارة الأعمال</TabsTrigger>
            <TabsTrigger value="links">روابط القراءة</TabsTrigger>
          </TabsList>

          {/* Works Management Tab */}
          <TabsContent value="works" className="space-y-6">
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  if (showForm) {
                    setFormData({
                      title: "",
                      description: "",
                      type: "manga",
                      status: "ongoing",
                      chapters: 0,
                      author: "",
                      genre: "",
                      coverImageUrl: "",
                    });
                    setSelectedGenres([]);
                  }
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {showForm ? "إلغاء" : "إضافة عمل جديد"}
              </Button>
            </div>

            {/* Form */}
            {showForm && (
              <Card className="p-6">
                <h2 className="text-elegant-md mb-6">
                  {editingId ? "تعديل العمل" : "إضافة عمل جديد"}
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      placeholder="العنوان"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                    <Input
                      placeholder="المؤلف"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                    />
                  </div>

                  <Textarea
                    placeholder="الوصف"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="min-h-24"
                  />

                  <div className="grid gap-4 md:grid-cols-4">
                    <Select
                      value={formData.type}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, type: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manga">مانجا</SelectItem>
                        <SelectItem value="manhwa">مانهوا</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.status}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, status: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">مستمر</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="hiatus">متوقف</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="عدد الفصول"
                      value={formData.chapters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chapters: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <Input
                    placeholder="رابط صورة الغلاف"
                    value={formData.coverImageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImageUrl: e.target.value })
                    }
                  />

                  <div>
                    <label className="text-sm font-medium mb-3 block">الأنواع</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border border-border rounded-lg">
                      {MANGA_GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            selectedGenres.includes(genre)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : editingId ? (
                        "تحديث"
                      ) : (
                        "إضافة"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Works Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      العنوان
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      النوع
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      الفصول
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      التقييم
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {works?.map((work) => (
                    <tr key={work.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{work.title}</td>
                      <td className="px-4 py-3 text-sm">
                        {work.type === "manga" ? "مانجا" : "مانهوا"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {work.status === "ongoing"
                          ? "مستمر"
                          : work.status === "completed"
                            ? "مكتمل"
                            : "متوقف"}
                      </td>
                      <td className="px-4 py-3 text-sm">{work.chapters}</td>
                      <td className="px-4 py-3 text-sm">{work.averageRating}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(work)}
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({ id: work.id })}
                            disabled={deleteMutation.isPending}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Reading Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">إضافة رابط قراءة جديد</h2>
              <div className="space-y-4">
                <Select value={readingLinkForm.workId} onValueChange={(value) =>
                  setReadingLinkForm({ ...readingLinkForm, workId: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العمل" />
                  </SelectTrigger>
                  <SelectContent>
                    {works?.map((work) => (
                      <SelectItem key={work.id} value={work.id.toString()}>
                        {work.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="المنصة (مثال: MangaDex, Webtoon, Tappytoon)"
                  value={readingLinkForm.platform}
                  onChange={(e) =>
                    setReadingLinkForm({
                      ...readingLinkForm,
                      platform: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="رابط القراءة"
                  value={readingLinkForm.url}
                  onChange={(e) =>
                    setReadingLinkForm({
                      ...readingLinkForm,
                      url: e.target.value,
                    })
                  }
                />

                <Button
                  onClick={handleAddReadingLink}
                  disabled={addReadingLinkMutation.isPending}
                  className="w-full"
                >
                  {addReadingLinkMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      إضافة الرابط
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
