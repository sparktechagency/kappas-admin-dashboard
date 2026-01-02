import { baseApi } from "../../utils/apiBaseQuery";

export const provincesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProvinces: builder.query({
      query: ({ page, searchTerm }) => {
        let url = '/province';

        const params = new URLSearchParams();

        if (page) params.append('page', page.toString());
        if (searchTerm) params.append('searchTerm', searchTerm);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        return {
          url,
          method: 'GET',
        };
      },
      providesTags: ['province'],
    }),

    createProvince: builder.mutation({
      query: (data) => ({
        url: "/province",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['province'],
    }),

    editProvince: builder.mutation({
      query: (data, id) => ({
        url: `/province/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['province'],
    }),

    deleteProvince: builder.mutation({
      query: (id) => ({
        url: `/province/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['province'],
    }),

  }),
  overrideExisting: true
});

// Export hooks
export const {
  useGetAllProvincesQuery,
  useCreateProvinceMutation,
  useEditProvinceMutation,
  useDeleteProvinceMutation
} = provincesApi;