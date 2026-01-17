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
import { ArrowLeft, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("يجب إدخال العنوان");
      return;
    }

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
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
    setEditingId(work.id);
    setShowForm(true);
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-elegant-lg">لوحة تحكم الإدارة</h1>
            <p className="text-muted-foreground">إدارة الأعمال والمحتوى</p>
          </div>
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
          <Card className="mb-8 p-6">
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

                <Input
                  placeholder="الأنواع (مفصولة بفواصل)"
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
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
      </div>
    </div>
  );
}
