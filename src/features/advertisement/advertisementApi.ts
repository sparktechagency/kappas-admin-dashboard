import { baseApi } from "../../utils/apiBaseQuery";

const advertisementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdvertisementCost: builder.query({
      query: () => {
        return {
          url: `/settings/per-day-advertisement-cost`,
          method: "GET",
        };
      },
      providesTags: ["advertisement"],
    }),

    updateAdvertisementCost: builder.mutation({
      query: (data) => {
        return {
          url: `/settings/per-day-advertisement-cost`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["advertisement"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdvertisementCostQuery,
  useUpdateAdvertisementCostMutation,
} = advertisementApi;
