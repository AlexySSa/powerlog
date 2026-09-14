"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { languages } from "@/lib/translations";
import { settingsSchema } from "@/lib/validators";

type FormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { user } = useAuth();
  const { data, updatePreferences } = useAppData();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(settingsSchema) as Resolver<FormValues>,
    values: {
      full_name: data.profile?.full_name ?? user?.full_name ?? "",
      preferred_language:
        data.profile?.preferred_language ?? user?.preferred_language ?? "es",
      preferred_theme:
        ((theme as "dark" | "light" | undefined) ??
          data.profile?.preferred_theme ??
          user?.preferred_theme ??
          "dark") as "dark" | "light",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setTheme(values.preferred_theme);
    await updatePreferences(values);
  };

  return (
    <Card className="border-0 bg-transparent p-0">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="md:col-span-2">
          <Label htmlFor="settings-name">{t("fullName")}</Label>
          <Input id="settings-name" {...register("full_name")} />
        </div>

        {user?.email ? <div>
          <Label htmlFor="settings-email">{t("email")}</Label>
          <Input
            id="settings-email"
            value={data.profile?.email ?? user?.email ?? ""}
            readOnly
          />
        </div> : null}

        <div>
          <Label htmlFor="settings-theme">{t("theme")}</Label>
          <Select id="settings-theme" {...register("preferred_theme")}>
            <option value="dark">{t("dark")}</option>
            <option value="light">{t("light")}</option>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="settings-language">{t("language")}</Label>
          <Select id="settings-language" {...register("preferred_language")}>
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? `${t("loading")}...` : t("save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
