import { baseApi } from "../../utils/apiBaseQuery";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmin: builder.query({
      query: () => ({
        url: `/dashboard/user/get-all-admins`,
        method: "GET",
      }),
      providesTags: ["admin"],
    }),

    createAdmin: builder.mutation({
      query: (data) => ({
        url: `/dashboard/user/make-admin`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admin"],
    }),

    editAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/dashboard/user/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["admin"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/dashboard/user/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admin"],
    }),

    adminChangePassword: builder.mutation({
      query: (data) => ({
        url: `/auth/change-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admin"],
    }),


  }),
});

// Export hooks
export const {
  useGetAdminQuery,
  useCreateAdminMutation,
  useEditAdminMutation,
  useDeleteAdminMutation,
  useAdminChangePasswordMutation
} = categoryApi;