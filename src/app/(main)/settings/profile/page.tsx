"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../../features/profile/profileApi';
import { baseURL } from '../../../../utils/BaseURL';

interface EditFormData {
  full_name: string;
  email: string;
  phone: string;
  image?: File | null;
}

// Error handling interfaces
interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
  status?: number;
}

interface SerializedError {
  message?: string;
  code?: string;
  name?: string;
}

const ProfileSettings = () => {
  const { data: profileResponse, isLoading, refetch } = useGetProfileQuery({});
  const [updateProfile, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();

  const profileData = profileResponse?.data;

  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [editFormData, setEditFormData] = useState<EditFormData>({
    full_name: '',
    email: '',
    phone: '',
    image: null,
  });

  useEffect(() => {
    if (profileData) {
      setEditFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        image: null,
      });
      setImagePreview(profileData.image || '');
    }
  }, [profileData]);

  const handleEditProfile = (): void => {
    setEditFormData({
      full_name: profileData?.full_name || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      image: null,
    });
    setImagePreview(profileData?.image || '');
    setIsEditProfileOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData({ ...editFormData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const formData = new FormData();

      // Create the data object as per Postman format
      const dataObject = {
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone: editFormData.phone
      };

      // Append data as JSON string
      formData.append('data', JSON.stringify(dataObject));

      // Append image file if exists
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }

      await updateProfile(formData).unwrap();
      toast.success('Profile updated successfully');
      setIsEditProfileOpen(false);
      refetch();
    } catch (error: unknown) {
      // Proper error handling with type safety
      let errorMessage = 'Failed to update profile';

      if (typeof error === 'object' && error !== null) {
        // Check if it's an API error with data
        const apiError = error as ApiError;
        if (apiError.data?.message) {
          errorMessage = apiError.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        // Check if it's a serialized error from RTK Query
        const serializedError = error as SerializedError;
        if (serializedError.message) {
          errorMessage = serializedError.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
      console.error('Profile update error:', error);
    }
  };

  const handleCancelEdit = (): void => {
    setEditFormData({
      full_name: '',
      email: '',
      phone: '',
      image: null,
    });
    setImagePreview('');
    setIsEditProfileOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  const imageSrc = (() => {
    if (imagePreview) {
      // base64 হলে কখনো baseURL যোগ করবে না
      if (imagePreview.startsWith("data:")) {
        return imagePreview;
      }
      // normal হলে baseURL যোগ করবে
      return baseURL + imagePreview;
    }

    // imagePreview নাই ⇒ এখন profile image check
    if (profileData?.image?.startsWith("/")) {
      return profileData.image; // baseURL যোগ করবে না
    }

    return baseURL + profileData?.image; // normal হলে যোগ করবে
  })();

  return (
    <div className="">
      <div className="bg-white p-8 rounded-2xl shadow-sm">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={baseURL + profileData?.image || '/default-avatar.png'}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData?.full_name || 'N/A'}
                </h2>
                <p className="text-gray-500">{profileData?.role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 text-gray-600 border py-1 px-3 cursor-pointer rounded-lg hover:text-gray-900 transition-colors"
            >
              <span className="text-sm font-medium">Edit</span>
              <Image src={"/icons/EditIcon.png"} width={20} height={20} alt='Edit icons' className='' />
            </button>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 text-gray-600 border py-1 px-3 cursor-pointer rounded-lg hover:text-gray-900 transition-colors"
            >
              <span className="text-sm font-medium">Edit</span>
              <Image src={"/icons/EditIcon.png"} width={20} height={20} alt='Edit icons' className='' />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="bg-red-50 rounded-lg px-4 py-3 text-gray-700">
                {profileData?.full_name || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="bg-red-50 rounded-lg px-4 py-3 text-gray-700">
                {profileData?.email || 'N/A'}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="bg-red-50 rounded-lg px-4 py-3 text-gray-700">
                {profileData?.phone || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <div className="bg-red-50 rounded-lg px-4 py-3 text-gray-700 capitalize">
                {profileData?.status || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl p-0">
          <div className="p-6">
            <DialogHeader className="flex flex-row items-center justify-between mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Edit Profile
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4">
                <Image
                  src={imageSrc || '/default-avatar.png'}
                  alt="Profile Preview"
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="cursor-pointer bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                  <span className="text-sm font-medium">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="Enter full name here.."
                  value={editFormData.full_name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, full_name: e.target.value })
                  }
                  className="w-full bg-red-50 border-0 rounded-lg px-4 py-3 placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email here.."
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full bg-red-50 border-0 rounded-lg px-4 py-3 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="Enter phone number here.."
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full bg-red-50 border-0 rounded-lg px-4 py-3 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-0 py-3 rounded-lg font-semibold"
                  disabled={updateProfileLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
                  disabled={updateProfileLoading}
                >
                  {updateProfileLoading ? 'Saving...' : 'Send Changes'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSettings;