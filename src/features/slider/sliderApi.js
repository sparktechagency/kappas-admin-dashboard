import { baseApi } from "../../utils/apiBaseQuery";

const SliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSlider: builder.query({
      query: () => {
        return {
          url: `/settings/banner-logo`,
          method: "GET",
        };
      },
      providesTags: ['banner'],
    }),


     updateBannerLogo : builder.mutation({
      query: (data) => {
        return {
          url: `/settings/banner-logo`,
          method: "PATCH",
          body:data
        };
      },
      providesTags: ['banner'],
    }),


  }),
  overrideExisting: true,
});

export const {
  useGetAllSliderQuery,
  useUpdateBannerLogoMutation
} = SliderApi;