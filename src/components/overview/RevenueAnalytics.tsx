"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRevinueChartsQuery } from "../../features/dashboard/overviewApi";

type OverviewData = {
  totalRevenue?: number;
  totalSales?: number;
};

type MonthlyStat = {
  _id: string; // Format: "2025-11"
  totalRevenue: number;
};

type RevenueDataPoint = {
  month: string;
  revenue: number;
};

type CustomDotProps = {
  cx?: number;
  cy?: number;
  payload?: RevenueDataPoint;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: RevenueDataPoint;
  }>;
};

type Props = {
  overviewData?: OverviewData;
};

export default function RevenueAnalytics({}: Props) {
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  // Fetch data from API based on selected year
  const {
    data: apiData,
    isLoading,
    isError,
  } = useRevinueChartsQuery(selectedYear);

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!apiData?.data?.monthlyStats) {
      return [];
    }

    // Create a map of all months
    const monthMap: { [key: string]: number } = {
      "01": 0,
      "02": 0,
      "03": 0,
      "04": 0,
      "05": 0,
      "06": 0,
      "07": 0,
      "08": 0,
      "09": 0,
      "10": 0,
      "11": 0,
      "12": 0,
    };

    // Fill in the data from API
    apiData.data.monthlyStats.forEach((stat: MonthlyStat) => {
      const monthKey = stat._id.split("-")[1]; // Extract month from "2025-11"
      monthMap[monthKey] = stat.totalRevenue || 0;
    });

    // Convert to chart format
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return Object.keys(monthMap).map((monthKey, index) => ({
      month: monthNames[index],
      revenue: monthMap[monthKey],
    }));
  }, [apiData]);

  // Find the maximum revenue for the reference line (instead of hardcoded June)
  const maxRevenueMonth = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, current) =>
      current.revenue > max.revenue ? current : max
    );
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#B91C1C] text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
          ${payload[0].value?.toLocaleString()}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    // Highlight the month with maximum revenue
    if (
      maxRevenueMonth &&
      payload?.month === maxRevenueMonth.month &&
      payload?.revenue === maxRevenueMonth.revenue
    ) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#B91C1C"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  // Calculate dynamic Y-axis ticks based on data
  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0)
      return [0, 2000, 4000, 6000, 8000, 10000, 12000];

    const maxRevenue = Math.max(...chartData.map((d) => d.revenue));
    const tickCount = 7;

    // Ensure we have a minimum interval to avoid duplicates
    const tickInterval = Math.max(
      Math.ceil(maxRevenue / (tickCount - 1) / 1000) * 1000,
      1000
    );

    // Generate ticks and filter out duplicates
    const ticks = Array.from({ length: tickCount }, (_, i) => i * tickInterval);

    // Remove duplicates and ensure unique values
    return Array.from(new Set(ticks));
  }, [chartData]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue Analytics
          </h2>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : isError ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-red-500">Error loading data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FCA5A5" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FCA5A5" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="0"
                stroke="#f0f0f0"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 13 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 13 }}
                tickFormatter={(value) => `$${value / 1000}k`}
                ticks={yAxisTicks}
              />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              {maxRevenueMonth && (
                <ReferenceLine
                  y={maxRevenueMonth.revenue}
                  stroke="#B91C1C"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B91C1C"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={<CustomDot />}
                activeDot={{
                  r: 6,
                  fill: "#B91C1C",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
