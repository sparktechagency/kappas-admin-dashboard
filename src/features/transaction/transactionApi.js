import { baseApi } from "../../utils/apiBaseQuery";

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllTransaction: builder.query({
      query: () => ({
        url: `/payment/admin`,
        method: "GET",
      }),
      providesTags: ["transaction"],
    }),

    getSingleTransaction: builder.query({
      query: (id) => ({
        url: `/payment/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["transaction"],
    }),

    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/payment/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['transaction'],
    }),
  }),
});

// Export hooks
export const {
  useDeleteTransactionMutation,
  useGetAllTransactionQuery,
  useGetSingleTransactionQuery
} = transactionApi;