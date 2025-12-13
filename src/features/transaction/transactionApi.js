import { baseApi } from "../../utils/apiBaseQuery";

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransaction: builder.query({
      query: ({ page = 1, limit = 10, searchTerm = "", status = "" }) => {
        const params = new URLSearchParams();

        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);

        const queryString = params.toString();
        return {
          url: `/payment/admin${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
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
      invalidatesTags: ["transaction"],
    }),
  }),
});

// Export hooks
export const {
  useDeleteTransactionMutation,
  useGetAllTransactionQuery,
  useGetSingleTransactionQuery,
} = transactionApi;
