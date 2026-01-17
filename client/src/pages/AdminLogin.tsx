import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import * as bcrypt from "bcryptjs";

// Hash لكلمة السر "hassan" باستخدام bcrypt
// يمكن إنشاء hash جديد باستخدام: bcrypt.hash('hassan', 12)
const ADMIN_PASSWORD_HASH = "$2b$12$TiIzlpdsbCHXJBISsedDWe5Z9816MO8H1C0Hj.LTpDPteFw15pdFG";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من كلمة السر باستخدام bcrypt
      const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

      if (isValid) {
        // حفظ حالة تسجيل الدخول في sessionStorage
        sessionStorage.setItem("adminAuthenticated", "true");
        toast.success("تم تسجيل الدخول بنجاح!");
        setLocation("/admin");
      } else {
        toast.error("كلمة السر غير صحيحة");
        setPassword("");
      }
    } catch (error) {
      console.error("خطأ في التحقق من كلمة السر:", error);
      toast.error("حدث خطأ أثناء التحقق من كلمة السر");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-elegant-lg mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">أدخل كلمة السر للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              كلمة السر
            </label>
            <Input
              type="password"
              placeholder="أدخل كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
              dir="auto"
              lang="ar"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full"
          >
            {isLoading ? "جاري التحقق..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>🔒 هذه الصفحة محمية بكلمة سر مشفرة</p>
        </div>
      </Card>
    </div>
  );
}
