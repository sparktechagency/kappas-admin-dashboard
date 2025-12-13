import { baseApi } from "../../utils/apiBaseQuery";

const subCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubCategory: builder.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams();

        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (searchTerm) params.append("searchTerm", searchTerm);

        const queryString = params.toString();
        return {
          url: `/subcategory${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["subcategory"],
    }),

    getSubCategoryById: builder.query({
      query: (id) => {
        return {
          url: `/subcategory/single/${id}`,
          method: "GET",
        };
      },
      providesTags: ["subcategory"],
    }),

    getSubCategoryReletedToCategory: builder.query({
      query: (id) => {
        return {
          url: `/subcategory/${id}`,
          method: "GET",
        };
      },
      providesTags: ["subcategory"],
    }),

    createSubcategory: builder.mutation({
      query: (data) => {
        return {
          url: `/subcategory/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["subcategory"],
    }),

    updateSubcategory: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/subcategory/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["subcategory"],
    }),

    deleteSubcategory: builder.mutation({
      query: (id) => {
        return {
          url: `/subcategory/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["subcategory"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllSubCategoryQuery,
  useGetSubCategoryByIdQuery,
  useGetSubCategoryReletedToCategoryQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subCategoryApi;
