"use client";

// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { cn } from '@/lib/utils';
// import { format } from 'date-fns';
import { DollarSign, Package, ShoppingCart, Store } from 'lucide-react';
// import { useState } from 'react';
// import { DateRange } from 'react-day-picker';
import { useGetOverviewDataQuery } from '../../features/dashboard/overviewApi';
import CustomLoading from '../Loading/CustomLoading';
import OrderStatistics from './OrderStatistics';
import RevenueAnalytics from './RevenueAnalytics';
import StatsCard from './StatsCard';
import TopCategory from './TopCategory';
import TotalOrder from './TotalOrder';

export default function Dashboard() {
  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: new Date(2024, 4, 1), // May 1, 2024
  //   to: new Date(2024, 4, 30), // May 30, 2024
  // });

  const { data, isLoading } = useGetOverviewDataQuery({});

  if (isLoading) {
    return (
      <>
        <CustomLoading />
      </>
    );
  }

  const overviewData = data?.data;

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/* <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Store"
            value={overviewData?.totalStores?.toString() || "0"}
            change="0.34%"
            changeType="increase"
            icon={Store}
            iconBg="bg-blue-500"
          />
          <StatsCard
            title="Total Product"
            value={overviewData?.totalProducts?.toString() || "0"}
            change="1.4%"
            changeType="increase"
            icon={Package}
            iconBg="bg-pink-500"
          />
          <StatsCard
            title="Total Sales"
            value={`$${overviewData?.totalSales?.toLocaleString() || "0"}`}
            change="1.4%"
            changeType="decrease"
            icon={ShoppingCart}
            iconBg="bg-orange-500"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${overviewData?.totalRevenue?.toLocaleString() || "0"}`}
            change="0.34%"
            changeType="increase"
            icon={DollarSign}
            iconBg="bg-red-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-full w-full">
            <TotalOrder overviewData={overviewData} />
          </div>
          <div className='h-full'>
            <OrderStatistics overviewData={overviewData} />
          </div>
        </div>
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueAnalytics overviewData={overviewData} />
          </div>
          <div className=''>
            <TopCategory overviewData={overviewData} />
          </div>
        </div>
      </div>
    </div>
  );
}