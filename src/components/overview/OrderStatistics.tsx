"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

type StatusWiseOrder = {
  _id: string;
  count: number;
};

type OverviewData = {
  totalOrdersCount?: number;
  statusWiseOrdersCount?: StatusWiseOrder[];
  weekOrderGrowth?: number;
  monthOrderGrowth?: number;
  yearOrderGrowth?: number;
};

type ChartDataItem = {
  name: string;
  value: number;
  color: string;
};

type Period = 'today' | 'week' | 'month';

type Props = {
  overviewData?: OverviewData;
};

export default function OrderStatistics({ overviewData }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');

  // Get growth percentage based on selected period
  const getGrowthPercentage = (period: Period): number => {
    switch (period) {
      case 'today':
        return overviewData?.weekOrderGrowth || 0;
      case 'week':
        return overviewData?.weekOrderGrowth || 0;
      case 'month':
        return overviewData?.monthOrderGrowth || 0;
      default:
        return 0;
    }
  };

  const growth = getGrowthPercentage(selectedPeriod);
  const totalOrders = overviewData?.totalOrdersCount || 0;

  // Process status data for chart
  const processStatusData = (): ChartDataItem[] => {
    const statusData = overviewData?.statusWiseOrdersCount || [];

    const colorMap: { [key: string]: string } = {
      'Completed': '#FF8A3D',
      'Pending': '#EF5A6F',
      'Cancelled': '#9B1C1C',
      'Delivered': '#FF8A3D',
      'Processing': '#EF5A6F'
    };

    return statusData.map(status => ({
      name: status._id,
      value: status.count,
      color: colorMap[status._id] || '#6B7280'
    }));
  };

  const chartData = processStatusData();

  return (
    <div className="w-full bg-white h-full">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Order Statistics</h2>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <button className="p-1 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSelectedPeriod('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('week')}>
                This week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('month')}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Total Orders */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 font-medium mb-1">TOTAL ORDERS</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900">
              {totalOrders.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth}% Growth
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        {chartData.length > 0 ? (
          <div className="mb-6 flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mb-6 flex justify-center items-center h-40">
            <div className="text-gray-500">No order data available</div>
          </div>
        )}

        {/* Legend */}
        <div className="space-y-3">
          {chartData.length > 0 ? (
            chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-700">{entry.name}</span>
                <span className="text-sm text-gray-700 ml-auto">({entry.value})</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No status data available</div>
          )}
        </div>
      </div>
    </div>
  );
}