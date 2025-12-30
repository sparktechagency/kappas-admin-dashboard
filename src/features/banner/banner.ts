import { baseApi } from "../../utils/apiBaseQuery";

const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBanner: builder.query({
      query: () => {
        return {
          url: `/settings/banner-logo`,
          method: "GET",
        };
      },
      providesTags: ["banner"],
    }),

    createBanner: builder.mutation({
      query: (data) => {
        return {
          url: `/settings/banner-logo`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["banner"],
    }),

    updateBanner: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/settings/banner-logo`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["banner"],
    }),

    deleteBanner: builder.mutation({
      query: (id) => {
        return {
          url: `/settings/banner-logo/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["banner"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
