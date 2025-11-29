import { baseApi } from "../../utils/apiBaseQuery";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ status, isRecentUsers, searchTerm }) => {
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        if (isRecentUsers) params.append("isRecentUsers", isRecentUsers);
        if (searchTerm) params.append("searchTerm", searchTerm);

        return {
          url: `/users/admin/all-users?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/dashboard/user/delete-user/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Users"],
    }),

    updateStatusByUser: builder.mutation({
      query: ({ data, id }) => ({
        url: `/users/admin/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Users"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateStatusByUserMutation
} = usersApi;