import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageUploader({
  onImageUploaded,
  label = "رفع صورة الغلاف",
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      toast.success("تم رفع الصورة بنجاح!");
      onImageUploaded(data.url);
      resetUploader();
    },
    onError: (error) => {
      toast.error(error.message || "فشل رفع الصورة");
      setUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > MAX_SIZE) {
      toast.error("حجم الملف يتجاوز 5MB");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP أو GIF");
      return;
    }

    setFileName(file.name);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !fileName) {
      toast.error("الرجاء اختيار صورة أولاً");
      return;
    }

    setUploading(true);

    // Convert data URL to base64
    const base64Data = preview.split(",")[1];

    uploadMutation.mutate({
      fileData: base64Data,
      fileName,
      mimeType: `image/${fileName.split(".").pop()?.toLowerCase()}`,
    });
  };

  const resetUploader = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">{label}</label>

      {/* Preview */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full object-cover rounded-lg border border-border"
          />
          <button
            onClick={resetUploader}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">اضغط أو اسحب صورة هنا</p>
          <p className="text-xs text-muted-foreground">
            JPEG أو PNG أو WebP أو GIF (حد أقصى 5MB)
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Info */}
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{fileName}</span>
        </div>
      )}

      {/* Upload Button */}
      {preview && (
        <Button
          onClick={handleUpload}
          disabled={uploading || disabled}
          className="w-full gap-2"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-primary" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              رفع الصورة
            </>
          )}
        </Button>
      )}

      {/* Error Message */}
      {uploadMutation.isError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadMutation.error?.message || "حدث خطأ أثناء الرفع"}</span>
        </div>
      )}
    </div>
  );
}
