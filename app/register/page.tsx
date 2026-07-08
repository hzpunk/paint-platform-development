"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Palette,
  Check,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * Маска для телефона: +7 (___) ___-__-__
 * Аналогичная маска используется в профиле (/account).
 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  let result = "+7";
  if (digits.length > 1) result += ` (${digits.slice(1, 4)}`;
  if (digits.length >= 4) result += ")";
  if (digits.length > 4) result += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) result += `-${digits.slice(9, 11)}`;
  return result;
}

/** Валидация надёжности пароля (>= 6 символов). */
function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
  if (pwd.length === 0) return { label: "", color: "", width: "0%" };
  if (pwd.length < 6) return { label: "Слабый", color: "bg-destructive", width: "33%" };
  if (pwd.length < 10) return { label: "Средний", color: "bg-yellow-500", width: "66%" };
  return { label: "Надёжный", color: "bg-green-500", width: "100%" };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referral, setReferral] = useState(refCode);
  const [loading, setLoading] = useState(false);

  // Чекбоксы согласия (ФЗ-152)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  }, []);

  const canSubmit = agreeTerms && agreePrivacy && email && password.length >= 6;

  const strength = getPasswordStrength(password);

  async function handle(e: React.FormEvent) {
    e.preventDefault();

    if (!agreeTerms || !agreePrivacy) {
      toast.error("Необходимо дать согласие на обработку данных и принять пользовательское соглашение");
      return;
    }
    if (!email || !password) {
      toast.error("Заполните email и пароль");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        name: name || undefined,
        phone: phone || undefined,
        password,
        referredByCode: referral || undefined,
      });
      toast.success("Регистрация завершена!");
      router.push("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Декоративный фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 30% 10%, hsl(var(--primary) / 0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 80% 90%, hsl(var(--accent) / 0.06), transparent 55%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full"
        style={{ maxWidth: "440px", width: "100%" }}
      >
        <div className="rounded-2xl border border-border/60 bg-card/95 p-8 shadow-xl backdrop-blur-sm">
          {/* Заголовок */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-7 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Palette className="size-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Создать аккаунт</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Зарегистрируйтесь и получайте бонусы
            </p>
          </motion.div>

          <form onSubmit={handle} className="flex flex-col gap-3.5">
            {/* Имя */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="reg-name" className="mb-1.5 text-sm font-medium">Имя</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-name"
                  placeholder="Как вас зовут?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="reg-email" className="mb-1.5 text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
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

            {/* Телефон */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="reg-phone" className="mb-1.5 text-sm font-medium">Телефон</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={handlePhone}
                  autoComplete="tel"
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* Пароль */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="reg-password" className="mb-1.5 text-sm font-medium">
                Пароль <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              {/* Индикатор надёжности пароля */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{strength.label}</span>
                </div>
              )}
            </motion.div>

            {/* Реферальный код */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <Label htmlFor="reg-referral" className="mb-1.5 text-sm font-medium">
                Реферальный код
                <span className="ml-1 text-xs text-muted-foreground">(если есть)</span>
              </Label>
              <Input
                id="reg-referral"
                placeholder="ABC12345"
                value={referral}
                onChange={(e) => setReferral(e.target.value.toUpperCase())}
                className="uppercase tracking-wider"
              />
            </motion.div>

            {/* Чекбоксы согласия (ФЗ-152 + пользовательское соглашение) */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mt-1 flex flex-col gap-3">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <Checkbox
                  id="agree-terms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                  Я принимаю{" "}
                  <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                    пользовательское соглашение
                  </Link>{" "}
                  и{" "}
                  <Link href="/loyalty-terms" target="_blank" className="text-primary underline hover:text-primary/80">
                    правила платформы
                  </Link>
                  {" "}<span className="text-destructive">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <Checkbox
                  id="agree-privacy"
                  checked={agreePrivacy}
                  onCheckedChange={(v) => setAgreePrivacy(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                  Я даю согласие на обработку моих{" "}
                  <Link href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80">
                    персональных данных
                  </Link>{" "}
                  в соответствии с ФЗ-152
                  {" "}<span className="text-destructive">*</span>
                </span>
              </label>
            </motion.div>

            {/* Кнопка регистрации */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="mt-1">
              <Button
                type="submit"
                disabled={loading || !canSubmit}
                size="lg"
                className="w-full gap-2 font-semibold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Регистрация...
                  </span>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Зарегистрироваться
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Ссылка на вход */}
          <motion.p
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
              Войти
            </Link>
          </motion.p>
        </div>

        {/* Нижняя правовая подпись */}
        <motion.p
          custom={9}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/70"
        >
          Регистрируясь, вы соглашаетесь с{" "}
          <Link href="/terms" className="underline transition-colors hover:text-foreground">
            пользовательским соглашением
          </Link>
          ,{" "}
          <Link href="/privacy" className="underline transition-colors hover:text-foreground">
            политикой конфиденциальности
          </Link>{" "}
          и даёте согласие на обработку персональных данных (ФЗ-152).
        </motion.p>
      </motion.div>
    </div>
  );
}
