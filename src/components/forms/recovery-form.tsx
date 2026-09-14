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
import { recoverySchema } from "@/lib/validators";
import { localDateInput } from "@/lib/utils";

type FormValues = z.infer<typeof recoverySchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs text-[#f87171]">{message}</p> : null;
}

export function RecoveryForm() {
  const { createRecoveryLog, dashboard } = useAppData();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(recoverySchema) as Resolver<FormValues>,
    defaultValues: {
      date: localDateInput(),
      bodyweight: dashboard.currentBodyweight ?? 82,
      sleep_hours: 7.5,
      sleep_quality: 7,
      energy: 7,
      stress: 4,
      low_back_pain: 2,
      knee_pain: 1,
      shoulder_pain: 1,
      mobility_done: true,
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createRecoveryLog(values);
    reset({
      ...values,
      date: localDateInput(),
      notes: "",
    });
  };

  return (
    <Card className="p-5">
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>{t("date")}</Label>
          <Input type="date" {...register("date")} />
          <FieldError message={errors.date?.message} />
        </div>

        <div>
          <Label>{t("bodyweight")}</Label>
          <Input type="number" step="0.1" {...register("bodyweight")} />
          <FieldError message={errors.bodyweight?.message} />
        </div>

        <div>
          <Label>{t("sleepHours")}</Label>
          <Input type="number" step="0.1" {...register("sleep_hours")} />
        </div>

        <div>
          <Label>{t("sleepQuality")}</Label>
          <Input type="number" min={1} max={10} {...register("sleep_quality")} />
        </div>

        <div>
          <Label>{t("energy")}</Label>
          <Input type="number" min={1} max={10} {...register("energy")} />
        </div>

        <div>
          <Label>{t("stress")}</Label>
          <Input type="number" min={1} max={10} {...register("stress")} />
        </div>

        <div>
          <Label>{t("lowBackPain")}</Label>
          <Input type="number" min={0} max={10} {...register("low_back_pain")} />
        </div>

        <div>
          <Label>{t("kneePain")}</Label>
          <Input type="number" min={0} max={10} {...register("knee_pain")} />
        </div>

        <div>
          <Label>{t("shoulderPain")}</Label>
          <Input type="number" min={0} max={10} {...register("shoulder_pain")} />
        </div>

        <div>
          <Label>{t("mobilityDone")}</Label>
          <Select {...register("mobility_done", { setValueAs: (value) => value === "true" })}>
            <option value="true">{t("yes")}</option>
            <option value="false">{t("no")}</option>
          </Select>
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <Label>{t("notes")}</Label>
          <Textarea {...register("notes")} />
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? `${t("loading")}...` : t("logRecovery")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
