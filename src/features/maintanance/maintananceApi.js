import { baseApi } from "../../utils/apiBaseQuery";

export const maintananceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateMaintainance: builder.mutation({
      query: (data) => ({
        url: `/settings/is-under-maintenance`,
        method: "PATCH",
        body: data
      }),
      providesTags: [""],
    }),
  }),
});
// Export hooks
export const {
  useUpdateMaintainanceMutation
} = maintananceApi;