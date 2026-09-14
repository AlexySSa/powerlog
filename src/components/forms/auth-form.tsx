"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }

      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="inline-flex rounded-[3px] border border-[var(--border)] bg-[var(--surface)] p-1">
        <button
          type="button"
          className={`rounded-[3px] px-4 py-2 text-sm font-semibold ${
            mode === "signin"
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--foreground-muted)]"
          }`}
          onClick={() => setMode("signin")}
        >
          {t("signIn")}
        </button>
        <button
          type="button"
          className={`rounded-[3px] px-4 py-2 text-sm font-semibold ${
            mode === "signup"
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--foreground-muted)]"
          }`}
          onClick={() => setMode("signup")}
        >
          {t("signUp")}
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <div>
            <Label htmlFor="full-name">{t("fullName")}</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Pedro Power"
              required
            />
          </div>
        ) : null}

        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? `${t("loading")}...` : mode === "signin" ? t("signIn") : t("signUp")}
        </Button>
      </form>

      <div className="mt-5 text-sm text-[var(--foreground-muted)]">
        <p>{t("createAccountHint")}</p>
      </div>

      <Link href="/" className="mt-4 inline-flex text-sm text-[var(--accent)]">
        {t("enterApp")}
      </Link>
    </Card>
  );
}
