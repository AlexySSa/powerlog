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
import { weeklyReviewSchema } from "@/lib/validators";
import { localDateInput } from "@/lib/utils";

type FormValues = z.infer<typeof weeklyReviewSchema>;

export function WeeklyReviewForm() {
  const { createWeeklyReview, data, dashboard } = useAppData();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(weeklyReviewSchema) as Resolver<FormValues>,
    defaultValues: {
      cycle_id: dashboard.activeCycle?.id,
      week_number: dashboard.currentWeek,
      review_date: localDateInput(),
      weekly_feeling: "",
      slept_enough: "",
      recovery_quality: "",
      pain_notes: "",
      improve_next: "",
      next_week_goal: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createWeeklyReview(values);
    reset({
      ...values,
      review_date: localDateInput(),
      weekly_feeling: "",
      slept_enough: "",
      recovery_quality: "",
      pain_notes: "",
      improve_next: "",
      next_week_goal: "",
    });
  };

  return (
    <Card className="p-5">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
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
          <Label>{t("week")}</Label>
          <Input type="number" min={1} max={8} {...register("week_number")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("date")}</Label>
          <Input type="date" {...register("review_date")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("howFelt")}</Label>
          <Textarea {...register("weekly_feeling")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("sleptEnough")}</Label>
          <Textarea {...register("slept_enough")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("recoveryQuestion")}</Label>
          <Textarea {...register("recovery_quality")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("painQuestion")}</Label>
          <Textarea {...register("pain_notes")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("improveQuestion")}</Label>
          <Textarea {...register("improve_next")} />
        </div>

        <div className="md:col-span-2">
          <Label>{t("nextGoalQuestion")}</Label>
          <Textarea {...register("next_week_goal")} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? `${t("loading")}...` : t("saveReview")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
