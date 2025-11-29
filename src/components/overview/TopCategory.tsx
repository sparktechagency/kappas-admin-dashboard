"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutGrid, MoreVertical } from 'lucide-react';
import { useState } from 'react';

type Category = {
  categoryName: string;
  totalProducts: number;
  categoryId: string;
};

type OverviewData = {
  topCategories?: Category[];
};

type Props = {
  overviewData?: OverviewData;
};

export default function TopCategory({ overviewData }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  console.log(selectedPeriod)

  const categories = overviewData?.topCategories || [];

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-lg p-2">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Top Category</h2>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
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

        {/* Category List */}
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-red-600 flex-shrink-0"
                    style={{
                      backgroundColor: index === 0 ? '#DC2626' : 'transparent',
                      borderColor: index === 0 ? '#DC2626' : '#DC2626'
                    }}
                  ></div>
                  <span className="text-gray-900 text-sm font-medium">{category.categoryName}</span>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  {category.totalProducts} products
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No category data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}