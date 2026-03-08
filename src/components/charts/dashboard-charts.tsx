"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import { SectionCard } from "@/components/ui/section-card";

const pieColors = ["#818cf8", "#6366f1", "#a78bfa", "#c084fc", "#5f5f78"];

export function DashboardCharts({
  ticketsByDay,
  queueBreakdown,
  categoryBreakdown,
}: {
  ticketsByDay: Array<{ day: string; volume: number }>;
  queueBreakdown: Array<{ queue: string; volume: number }>;
  categoryBreakdown: Array<{ category: string; volume: number }>;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <SectionCard
        title="Ticket Throughput"
        description="Seven-day view of intake volume using the seeded MSP workload."
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ticketsByDay} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ticketArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "#8b8ba0" }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={12} tick={{ fill: "#8b8ba0" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f1f4" }} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#818cf8"
                fillOpacity={1}
                fill="url(#ticketArea)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      <div className="grid gap-5">
        <SectionCard
          title="Queue Distribution"
          description="Current routing distribution across specialist teams."
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={queueBreakdown}
                  dataKey="volume"
                  nameKey="queue"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {queueBreakdown.map((entry, index) => (
                    <Cell
                      key={`${entry.queue}-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f1f4" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Recurring Categories"
          description="Top ticket patterns currently visible in the seeded data."
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdown.slice(0, 5)}
                layout="vertical"
                margin={{ left: 15, right: 10, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: "#8b8ba0" }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  fontSize={12}
                  tick={{ fill: "#8b8ba0" }}
                />
                <Tooltip contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f1f4" }} />
                <Bar dataKey="volume" fill="#a78bfa" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
