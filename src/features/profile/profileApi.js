import { baseApi } from "../../utils/apiBaseQuery";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: `/users/profile`,
        method: "GET",
      }),
      providesTags: ["profile"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/users/profile`,
        method: "PATCH",
        body: data
      }),
      providesTags: ["profile"],
    }),
  }),
});

// Export hooks
export const {
  useGetProfileQuery,
  useUpdateProfileMutation
} = profileApi;