import { baseApi } from "../../utils/apiBaseQuery";

export const maintananceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintainance: builder.query({
      query: () => ({
        url: `/settings/is-under-maintenance`,
        method: "GET",
      }),
      providesTags: ["maintanance"],
    }),

    updateMaintainance: builder.mutation({
      query: (data) => ({
        url: `/settings/is-under-maintenance`,
        method: "PATCH",
        body: data
      }),
      providesTags: ["maintanance"],
    }),

  }),
  overrideExisting: true
});
// Export hooks
export const {
  useUpdateMaintainanceMutation,
  useGetMaintainanceQuery
} = maintananceApi;