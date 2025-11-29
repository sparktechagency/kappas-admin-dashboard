"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useOrderChartsQuery } from '../../features/dashboard/overviewApi';

type OverviewData = {
  totalOrdersCount?: number;
  totalOrdersAmount?: number;
};

type MonthlyStat = {
  _id: string; // Format: "2025-11"
  totalOrders?: number;
  orderCount?: number;
};

type MonthlyData = {
  month: string;
  orders: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: MonthlyData;
  }>;
};



type Props = {
  overviewData?: OverviewData;
};

export default function TotalOrder({ }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch data from API based on selected year
  const { data: apiData, isLoading, isError } = useOrderChartsQuery(selectedYear);
  console.log(apiData)

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!apiData?.data?.monthlyStats) {
      return [];
    }

    // Create a map of all months
    const monthMap: { [key: string]: number } = {
      '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
      '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0
    };

    // Fill in the data from API
    apiData.data.monthlyStats.forEach((stat: MonthlyStat) => {
      const monthKey = stat._id.split('-')[1]; // Extract month from "2025-11"
      monthMap[monthKey] = stat.totalOrders || stat.orderCount || 0;
    });

    // Convert to chart format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Object.keys(monthMap).map((monthKey, index) => ({
      month: monthNames[index],
      orders: monthMap[monthKey]
    }));
  }, [apiData]);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#B91C1C] text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
          {payload[0].value?.toLocaleString()} orders
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl shadow-lg p-8 bg-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Total Order</h2>
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
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              onMouseMove={(state) => {
                if (state?.isTooltipActive) {
                  const index = state.activeTooltipIndex;
                  setHoveredIndex(typeof index === 'number' ? index : null);
                } else {
                  setHoveredIndex(null);
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 14 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 14 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Bar
                dataKey="orders"
                fill="#B91C1C"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? '#9B1C1C' : '#B91C1C'}
                    opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}