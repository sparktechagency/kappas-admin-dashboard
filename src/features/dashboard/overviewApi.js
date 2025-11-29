import { baseApi } from "../../utils/apiBaseQuery";


export const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewData: builder.query({
      query: () => ({
        url: "/dashboard/overview",
        method: "GET",
      }),
    }),

    orderCharts: builder.query({
      query: (year) => ({
        url: `/dashboard/orders/yearly-stats?year=${year}`,
        method: "GET",
      }),
    }),

    revinueCharts: builder.query({
      query: (year) => ({
        url: `/dashboard/revenue/yearly-stats?year=${year}`,
        method: "GET",
      }),
    }),

  }),
});

// Export hooks
export const {
  useGetOverviewDataQuery,
  useOrderChartsQuery,
  useRevinueChartsQuery
} = overviewApi;
