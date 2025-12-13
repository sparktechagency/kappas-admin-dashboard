import { baseApi } from "../../utils/apiBaseQuery";

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVendorsState: builder.query({
      query: () => ({
        url: `/dashboard/vendors/stats`,
        method: "GET",
      }),
      providesTags: ["vendor"],
    }),

    getAllVendors: builder.query({
      query: ({ limit, page, province }) => {
        const params = new URLSearchParams();

        if (province) {
          params.append("province", province.toLowerCase());
        }
        if (limit) {
          params.append("limit", limit.toString());
        }
        if (page) {
          params.append("page", page.toString());
        }

        const queryString = params.toString();
        const url = `/dashboard/vendors${queryString ? `?${queryString}` : ""}`;

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["vendor"],
    }),

    toggleVendorStatus: builder.mutation({
      query: (id) => ({
        url: `/dashboard/vendors/status/${id}`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: ["vendor"],
    }),

    deleteVendors: builder.mutation({
      query: (id) => ({
        url: `/dashboard/vendors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["vendor"],
    }),

    getStoreDetails: builder.query({
      query: (id) => ({
        url: `/dashboard/stores/${id}`,
        method: "GET",
      }),
      providesTags: ["vendor"],
    }),

    getStoreState: builder.query({
      query: (id) => ({
        url: `/dashboard/stores/stats/${id}`,
        method: "GET",
      }),
      providesTags: ["vendor"],
    }),

    getStoreProduct: builder.query({
      query: (id) => ({
        url: `/dashboard/stores/products/${id}`,
        method: "GET",
      }),
      providesTags: ["vendor"],
    }),

    getProductById: builder.query({
      query: (id) => ({
        url: `/product/${id}`,
        method: "GET",
      }),
      providesTags: ["vendor"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["vendor"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllVendorsStateQuery,
  useGetAllVendorsQuery,
  useToggleVendorStatusMutation,
  useDeleteVendorsMutation,
  useGetStoreDetailsQuery,
  useGetStoreStateQuery,
  useGetStoreProductQuery,
  useGetProductByIdQuery,
  useDeleteProductMutation,
} = vendorApi;
