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
    <section className="chart-panel">
      <div className="mb-5 border-b border-[var(--border)] pb-4">
        <h3 className="section-title">{title}</h3>
        <p className="mt-2 text-xs text-[var(--foreground-muted)]">{description}</p>
        {data.length && series.length > 1 ? <div className="mt-3 flex flex-wrap gap-4">{series.map((item) => <span key={item.key} className="flex items-center gap-2 text-[10px] text-[var(--foreground-muted)]"><span className="h-[2px] w-4" style={{ backgroundColor: item.color }} />{item.label}</span>)}</div> : null}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin datos todavía"
          description="Todavía no hay registros para esta gráfica."
        />
      ) : (
        <div className="h-56 w-full">
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
                    borderRadius: 3,
                  }}
                />
                {series.map((item) => (
                  <Bar
                    key={item.key}
                    dataKey={item.key}
                    name={item.label}
                    fill={item.color}
                    radius={[1, 1, 0, 0]}
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
                    borderRadius: 3,
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
                    strokeWidth={2}
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
                    borderRadius: 3,
                  }}
                />
                {series.map((item) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
