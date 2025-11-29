import { baseApi } from "../../utils/apiBaseQuery";

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacyPolicy: builder.query({
      query: () => ({
        url: "/settings/privacy-policy",
        method: "GET",
      }),
      invalidatesTags: ['CMS'],
    }),

    createPrivacyPolicy: builder.mutation({
      query: (data) => ({
        url: "/settings/privacy-policy",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ['CMS'],
    }),

    getTermAndCondtion: builder.query({
      query: () => ({
        url: "/settings/termsOfService",
        method: "GET",
      }),
      invalidatesTags: ['CMS'],
    }),


    createTermsAndCondition: builder.mutation({
      query: (data) => ({
        url: "/settings/termsOfService",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ['CMS'],
    }),

  }),
});

// Export hooks
export const {
  useGetPrivacyPolicyQuery,
  useCreatePrivacyPolicyMutation,
  useGetTermAndCondtionQuery,
  useCreateTermsAndConditionMutation
} = cmsApi;