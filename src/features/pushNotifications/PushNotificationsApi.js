import { baseApi } from "../../utils/apiBaseQuery";

export const pushNotificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createpushNotifications: builder.mutation({
      query: (data) => ({
        url: "/pushNotification/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['pushNotifications'],
    }),


  }),
});

// Export hooks
export const {
  useCreatepushNotificationsMutation,
} = pushNotificationsApi;