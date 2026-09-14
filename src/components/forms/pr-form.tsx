"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { prSchema } from "@/lib/validators";
import { localDateInput } from "@/lib/utils";

type FormValues = z.infer<typeof prSchema>;

export function PRForm() {
  const { createPR, data, dashboard } = useAppData();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(prSchema) as Resolver<FormValues>,
    defaultValues: {
      cycle_id: dashboard.activeCycle?.id,
      date: localDateInput(),
      exercise: "Sentadilla",
      weight: dashboard.currentSquatRm ?? 180,
      bodyweight: dashboard.currentBodyweight ?? 82,
      video_url: "",
      comments: "",
      is_pr: true,
      successful: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createPR(values);
    reset({
      ...values,
      date: localDateInput(),
      video_url: "",
      comments: "",
    });
  };

  return (
    <Card className="p-5">
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>{t("cycle")}</Label>
          <Select {...register("cycle_id")}>
            <option value="">{t("currentCycle")}</option>
            {data.cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{t("date")}</Label>
          <Input type="date" {...register("date")} />
        </div>

        <div>
          <Label>{t("exercise")}</Label>
          <Input {...register("exercise")} />
        </div>

        <div>
          <Label>{t("weight")}</Label>
          <Input type="number" step="0.5" {...register("weight")} />
        </div>

        <div>
          <Label>{t("bodyweight")}</Label>
          <Input type="number" step="0.1" {...register("bodyweight")} />
        </div>

        <div>
          <Label>{t("video")}</Label>
          <Input placeholder="https://..." {...register("video_url")} />
        </div>

        <div>
          <Label>{t("isPr")}</Label>
          <Select {...register("is_pr", { setValueAs: (value) => value === "true" })}>
            <option value="true">{t("yes")}</option>
            <option value="false">{t("no")}</option>
          </Select>
        </div>

        <div>
          <Label>{t("successful")}</Label>
          <Select {...register("successful", { setValueAs: (value) => value === "true" })}>
            <option value="true">{t("successful")}</option>
            <option value="false">{t("failedAttempt")}</option>
          </Select>
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <Label>{t("comments")}</Label>
          <Textarea {...register("comments")} />
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? `${t("loading")}...` : t("logPr")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
