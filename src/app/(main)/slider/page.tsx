"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, Upload } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CustomLoading from '../../../components/Loading/CustomLoading';
import {
  useGetAllSliderQuery,
  useUpdateBannerLogoMutation
} from '../../../features/slider/sliderApi';
import { baseURL } from '../../../utils/BaseURL';

interface BannerData {
  banner: string[];
  logo: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: BannerData;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const BannerList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [bannerToEdit, setBannerToEdit] = useState<{ index: number, url: string } | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'banner' | 'logo'>('banner');

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // API Hooks
  const { data, isLoading, isError, error, refetch } = useGetAllSliderQuery({});
  const [updateBannerLogo, { isLoading: isUpdating }] = useUpdateBannerLogoMutation();

  // Extract banner data from API response
  const apiData = data as ApiResponse | undefined;
  const bannerList = apiData?.data?.banner || [];
  const logo = apiData?.data?.logo || '';

  console.log("banner list", bannerList)

  // Client-side filtering as fallback - only on client side
  const filteredBanners = useMemo(() => {
    if (!isClient) return bannerList;
    if (!searchTerm) return bannerList;
    return bannerList.filter((banner, index) =>
      `Banner ${index + 1}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bannerList, searchTerm, isClient]);

  // Safe image URL helper
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (isClient && !imagePath.startsWith('http') && !imagePath.startsWith('blob:')) {
      return baseURL + imagePath;
    }
    return imagePath;
  };

  const handleAddBanner = () => {
    setBannerImage(null);
    setBannerImagePreview(null);
    setAddDialogOpen(true);
  };

  const handleEditBanner = (index: number, bannerUrl: string) => {
    setBannerToEdit({ index, url: bannerUrl });
    setBannerImage(null);
    const imageUrl = getImageUrl(bannerUrl);
    setBannerImagePreview(imageUrl);
    setEditDialogOpen(true);
  };

  const handleEditLogo = () => {
    setLogoImage(null);
    const imageUrl = getImageUrl(logo);
    setLogoImagePreview(imageUrl);
    setActiveTab('logo');
  };

  const handleDeleteClick = (index: number) => {
    setBannerToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete === null) return;

    try {
      const currentBanners = [...bannerList];
      currentBanners.splice(bannerToDelete, 1);

      const formData = new FormData();
      const updateData = {
        banner: currentBanners
      };

      formData.append('data', JSON.stringify(updateData));

      await updateBannerLogo(formData).unwrap();
      toast.success('Banner deleted successfully');
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
      refetch();
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to delete banner');
    }
  };

  const handleAddBannerSubmit = async () => {
    if (!bannerImage) {
      toast.error('Please upload banner image');
      return;
    }

    try {
      const currentBanners = [...bannerList];

      // In a real implementation, you would upload the image first and get the URL
      // For now, we'll simulate by adding a placeholder
      const newBannerUrl = `/banner/new-banner-${Date.now()}.jpg`;
      currentBanners.push(newBannerUrl);

      const formData = new FormData();
      const updateData = {
        banner: currentBanners
      };

      formData.append('data', JSON.stringify(updateData));
      formData.append('banner', bannerImage);

      await updateBannerLogo(formData).unwrap();
      toast.success('Banner added successfully');
      setAddDialogOpen(false);
      setBannerImage(null);
      setBannerImagePreview(null);
      refetch();
    } catch (error: unknown) {
      console.error('Add banner error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to add banner');
    }
  };

  const handleUpdateBanner = async () => {
    if (!bannerToEdit) return;

    try {
      const currentBanners = [...bannerList];

      const formData = new FormData();
      const updateData = {
        banner: currentBanners
      };

      formData.append('data', JSON.stringify(updateData));

      // Only append banner if a new image was selected
      if (bannerImage) {
        formData.append('banner', bannerImage);
      }

      await updateBannerLogo(formData).unwrap();
      toast.success('Banner updated successfully');
      setEditDialogOpen(false);
      setBannerToEdit(null);
      setBannerImage(null);
      setBannerImagePreview(null);
      refetch();
    } catch (error: unknown) {
      console.error('Update banner error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to update banner');
    }
  };

  const handleUpdateLogo = async () => {
    if (!logoImage) {
      toast.error('Please upload logo image');
      return;
    }

    try {
      const formData = new FormData();
      const updateData = {
        logo: logo
      };

      formData.append('data', JSON.stringify(updateData));
      formData.append('logo', logoImage);

      await updateBannerLogo(formData).unwrap();
      toast.success('Logo updated successfully');
      setLogoImage(null);
      setLogoImagePreview(null);
      refetch();
    } catch (error: unknown) {
      console.error('Update logo error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to update logo');
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (type === 'banner') {
        setBannerImage(file);
        const imageUrl = URL.createObjectURL(file);
        setBannerImagePreview(imageUrl);
      } else {
        setLogoImage(file);
        const imageUrl = URL.createObjectURL(file);
        setLogoImagePreview(imageUrl);
      }
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (bannerImagePreview && bannerImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerImagePreview);
      }
      if (logoImagePreview && logoImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoImagePreview);
      }
    };
  }, [bannerImagePreview, logoImagePreview]);

  const ImageUploadArea = ({
    id,
    imageUrl,
    type = 'banner'
  }: {
    id: string;
    imageUrl: string | null;
    type?: 'banner' | 'logo';
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, type)}
      />
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        {imageUrl ? (
          <>
            <div className="mb-3">
              <Image
                height={1000}
                width={1000}
                src={imageUrl}
                alt={type === 'banner' ? 'Banner preview' : 'Logo preview'}
                className={`${type === 'banner' ? 'w-64 h-32' : 'w-32 h-32'} object-cover rounded-lg`}
                priority={false}
              />
            </div>
            <p className="text-sm text-gray-600">
              Click to change image
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-gray-900" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Drop your Image here or{' '}
              <span className="text-red-600 font-medium">Click to upload</span>
            </p>
          </>
        )}
      </label>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        <CustomLoading />
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold">Error loading banners</p>
            <p className="mt-2 text-gray-600">
              {error && 'data' in error ? JSON.stringify(error.data) : 'An error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Banner & Logo Management</h1>

        {/* Tabs for Banner and Logo */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('banner')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'banner'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Banners
              </button>
              <button
                onClick={() => setActiveTab('logo')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'logo'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Logo
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'banner' ? (
          <div className="bg-white rounded-lg shadow">
            {/* Header with Add Button and Search */}


            {/* Table */}
            <div className="overflow-x-auto">
              {filteredBanners.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No banners found</p>
                  {searchTerm && (
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your search term
                    </p>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Banner Preview</th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredBanners.map((banner, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === filteredBanners.length - 1 ? 'border-b-0' : ''
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {banner ? (
                              <Image
                                src={baseURL + banner || '/placeholder-image.png'}
                                alt={`Banner ${index + 1}`}
                                width={128}
                                height={64}
                                className="w-full h-full object-cover"
                                priority={false}
                              />
                            ) : (
                              <span className="text-xl">🖼️</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleEditBanner(index, banner)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Logo Settings</h2>
              <Button
                onClick={handleEditLogo}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Logo
              </Button>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">Current Logo</Label>
              </div>
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-6">
                {logo ? (
                  <Image
                    src={getImageUrl(logo) || '/placeholder-image.png'}
                    alt="Website Logo"
                    width={192}
                    height={192}
                    className="w-full h-full object-contain"
                    priority={false}
                  />
                ) : (
                  <span className="text-xl">🏢</span>
                )}
              </div>

              {logoImagePreview && (
                <div className="mt-6">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700">New Logo Preview</Label>
                  </div>
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                    <Image
                      src={logoImagePreview}
                      alt="New Logo Preview"
                      width={192}
                      height={192}
                      className="w-full h-full object-contain"
                      priority={false}
                    />
                  </div>
                  <Button
                    onClick={handleUpdateLogo}
                    className="bg-red-700 hover:bg-red-800 text-white"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Logo'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Banner Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Banner Image <span className="text-red-600">*</span>
              </Label>
              <ImageUploadArea id="banner-upload" imageUrl={bannerImagePreview} type="banner" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBannerSubmit}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? 'Adding...' : 'Add Banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Banner Image <span className="text-red-600">*</span>
              </Label>
              <ImageUploadArea id="edit-banner-upload" imageUrl={bannerImagePreview} type="banner" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBanner}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default BannerList;