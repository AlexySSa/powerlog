"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

type Series = {
  key: string;
  label: string;
  color: string;
};

interface TrendChartCardProps {
  title: string;
  description: string;
  series: Series[];
  type?: "line" | "area" | "bar";
}

interface GenericTrendChartCardProps<T extends object> extends TrendChartCardProps {
  data: T[];
}

export function TrendChartCard<T extends object>({
  title,
  description,
  data,
  series,
  type = "line",
}: GenericTrendChartCardProps<T>) {
  return (
    <Card className="p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{description}</p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin datos todavía"
          description="Guarda algunos registros para desbloquear esta gráfica."
        />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                {series.map((item) => (
                  <Bar
                    key={item.key}
                    dataKey={item.key}
                    name={item.label}
                    fill={item.color}
                    radius={[12, 12, 4, 4]}
                  />
                ))}
              </BarChart>
            ) : type === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                {series.map((item) => (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    fill={item.color}
                    fillOpacity={0.18}
                    strokeWidth={3}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--foreground-soft)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                {series.map((item) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
