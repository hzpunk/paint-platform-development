"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { LogIn, Mail, Lock, Eye, EyeOff, Palette } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Вход выполнен");
      router.push("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Декоративный фоновый градиент */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 70% 10%, hsl(var(--primary) / 0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 20% 90%, hsl(var(--accent) / 0.06), transparent 55%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        {/* Карточка формы */}
        <div className="rounded-2xl border border-border/60 bg-card/95 p-8 shadow-xl backdrop-blur-sm">
          {/* Лого и заголовок */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Palette className="size-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Вход в аккаунт</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Добро пожаловать в КраскиУНАС
            </p>
          </motion.div>

          <form onSubmit={handle} className="flex flex-col gap-4">
            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="login-email" className="mb-1.5 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* Пароль */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="login-password" className="mb-1.5 text-sm font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </motion.div>

            {/* Кнопка входа */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full gap-2 font-semibold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Вход...
                  </span>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    Войти
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Ссылка на регистрацию */}
          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
              Зарегистрироваться
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
