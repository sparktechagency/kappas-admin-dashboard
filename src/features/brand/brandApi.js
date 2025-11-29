import { baseApi } from "../../utils/apiBaseQuery";


const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBrand: builder.query({
      query: () => {
        return {
          url: `/brand`,
          method: "GET",
        };
      },
      providesTags: ['brand'],
    }),


    createBrand: builder.mutation({
      query: (data) => {
        return {
          url: `/brand/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ['brand'],
    }),

    updateCetgory: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/brand/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ['brand'],
    }),



    deleteBrand: builder.mutation({
      query: (id) => {
        return {
          url: `/brand/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ['brand'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllBrandQuery,
  useCreateBrandMutation,
  useUpdateCetgoryMutation,
  useDeleteBrandMutation,
} = brandApi;