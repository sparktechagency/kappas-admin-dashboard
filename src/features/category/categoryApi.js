import { baseApi } from "../../utils/apiBaseQuery";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategory: builder.query({
      query: ({ page = 1, limit = 10, searchTerm = '' }) => ({
        url: `/category`,
        method: "GET",
        params: {
          page,
          limit,
          searchTerm: searchTerm || undefined, // Only include if not empty
        },
      }),
      providesTags: ['Category'],
    }),

    getSingleCategory: builder.query({
      query: (id) => ({
        url: `/category/single/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

// Export hooks
export const {
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;