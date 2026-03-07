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

const pieColors = ["#0f766e", "#2563eb", "#d97706", "#dc2626", "#475569"];

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
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#0f766e"
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
                <Tooltip />
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
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  fontSize={12}
                />
                <Tooltip />
                <Bar dataKey="volume" fill="#2563eb" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
