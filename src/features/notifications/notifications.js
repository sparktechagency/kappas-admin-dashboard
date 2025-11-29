import { baseApi } from "../../utils/apiBaseQuery";


export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      query: () => ({
        url: `/notifications/admin`,
        method: "GET",
      }),
      providesTags: ["notifications"],
    }),

    readSingleNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/admin/single/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),


    readAllNotification: builder.mutation({
      query: () => ({
        url: `/notifications/admin`,
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),


    deleteSingleNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notifications"],
    }),

    deleteAllNotification: builder.mutation({
      query: () => ({
        url: `/notifications/my-notifications`,
        method: "DELETE",
      }),
      invalidatesTags: ["notifications"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllNotificationsQuery,
  useReadSingleNotificationMutation,
  useReadAllNotificationMutation,
  useDeleteSingleNotificationMutation,
  useDeleteAllNotificationMutation
} = notificationsApi;