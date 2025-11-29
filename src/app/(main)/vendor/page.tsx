"use client";

import { DollarSign, Package, ShoppingCart, Store } from 'lucide-react';
import StatsCard from '../../../components/overview/StatsCard';
import VendorList from '../../../components/vendor/VendorTable';
import { useGetAllVendorsStateQuery } from '../../../features/vendor/vendorApi';

const Page = () => {
  const { data, isLoading, isError } = useGetAllVendorsStateQuery({});

  // Show loading state
  if (isLoading) {
    return (
      <section className='space-y-5 p-6'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  // Show error state
  if (isError || !data?.data) {
    return (
      <section className='space-y-5 p-6'>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load vendor statistics. Please try again.
        </div>
      </section>
    );
  }

  const stats = data.data;

  return (
    <section className='space-y-5 p-6'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Store"
          value={stats.totalStore.toString()}
          change="0.34%"
          changeType="increase"
          icon={Store}
          iconBg="bg-blue-500"
        />
        <StatsCard
          title="Active Stores"
          value={stats.totalActiveStore.toString()}
          change="1.4%"
          changeType="increase"
          icon={Package}
          iconBg="bg-pink-500"
        />
        <StatsCard
          title="Inactive Stores"
          value={stats.totalInactiveStore.toString()}
          change="1.4%"
          changeType="decrease"
          icon={ShoppingCart}
          iconBg="bg-orange-500"
        />
        <StatsCard
          title="New Joined Store"
          value={stats.newJoinedStore.toString()}
          change="0.34%"
          changeType="increase"
          icon={DollarSign}
          iconBg="bg-red-600"
        />
      </div>

      <div>
        <VendorList />
      </div>
    </section>
  );
};

export default Page;