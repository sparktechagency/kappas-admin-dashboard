import { baseApi } from "../../utils/apiBaseQuery";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFaq: builder.query({
      query: ({ page = 1, limit = 10, type }) => ({
        url: `/faq?type=${type}`,
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
      providesTags: ['faq'],
    }),

    createFaq: builder.mutation({
      query: (data) => ({
        url: "/faq",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['faq'],
    }),

    updateFaq: builder.mutation({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['faq'],
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['faq'],
    }),
  }),
});

// Export hooks
export const {
  useGetAllFaqQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;