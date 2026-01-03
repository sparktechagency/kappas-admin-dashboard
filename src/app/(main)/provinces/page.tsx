"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Search, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

import {
  useCreateProvinceMutation,
  useDeleteProvinceMutation,
  useEditProvinceMutation,
  useGetAllProvincesQuery,
} from "../../../features/provinces/provincesApi";
import { baseURL } from "../../../utils/BaseURL";
import toast from 'react-hot-toast';

interface Province {
  _id: string;
  image: string[];
  title: string;
  description: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProvinceApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
    result: Province[];
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const ProvincePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [limit] = useState<number>(10);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [provinceToDelete, setProvinceToDelete] = useState<string | null>(null);
  const [provinceToEdit, setProvinceToEdit] = useState<Province | null>(null);
  const [provinceTitle, setProvinceTitle] = useState<string>("");
  const [provinceDescription, setProvinceDescription] = useState<string>("");
  const [provinceImages, setProvinceImages] = useState<File[]>([]);
  const [provinceImagePreviews, setProvinceImagePreviews] = useState<string[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // API Hooks
  const { data, isLoading, isError, error } = useGetAllProvincesQuery({
    page: currentPage,
    limit: limit,
    searchTerm: debouncedSearchTerm,
  });

  const [createProvince, { isLoading: isCreating }] = useCreateProvinceMutation();
  const [editProvince, { isLoading: isUpdating }] = useEditProvinceMutation();
  const [deleteProvince, { isLoading: isDeleting }] = useDeleteProvinceMutation();

  // Extract provinces from API response
  const apiData = data as ProvinceApiResponse | undefined;
  const provinces = apiData?.data?.result || [];
  const meta = apiData?.data?.meta || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };

  // Safe image URL helper
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (isClient && !imagePath.startsWith("http") && !imagePath.startsWith("blob:")) {
      return baseURL + imagePath;
    }
    return imagePath;
  };

  const handleAddProvince = () => {
    setProvinceTitle("");
    setProvinceDescription("");
    setProvinceImages([]);
    setProvinceImagePreviews([]);
    setAddDialogOpen(true);
  };

  const handleEditProvince = (province: Province) => {
    setProvinceToEdit(province);
    setProvinceTitle(province.title);
    setProvinceDescription(province.description);
    setProvinceImages([]);
    const imagePreviews = province.image.map((img) => getImageUrl(img) || "");
    setProvinceImagePreviews(imagePreviews);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (provinceId: string) => {
    setProvinceToDelete(provinceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!provinceToDelete) return;

    try {
      await deleteProvince(provinceToDelete).unwrap();
      toast.success("Province deleted successfully");
      setDeleteDialogOpen(false);
      setProvinceToDelete(null);
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to delete province");
    }
  };

  const handleCreate = async () => {
    if (!provinceTitle.trim()) {
      toast.error("Please enter province title");
      return;
    }

    if (!provinceDescription.trim()) {
      toast.error("Please enter province description");
      return;
    }

    if (provinceImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      const formData = new FormData();

      const provinceData = {
        title: provinceTitle.trim(),
        description: provinceDescription.trim(),
      };

      formData.append("data", JSON.stringify(provinceData));

      provinceImages.forEach((image) => {
        formData.append("image", image);
      });

      await createProvince(formData).unwrap();
      toast.success("Province created successfully");
      setAddDialogOpen(false);
      setProvinceTitle("");
      setProvinceDescription("");
      setProvinceImages([]);
      setProvinceImagePreviews([]);
    } catch (error: unknown) {
      console.error("Create error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to create province");
    }
  };

  const handleUpdate = async () => {
    if (!provinceTitle.trim()) {
      toast.error("Please enter province title");
      return;
    }

    if (!provinceDescription.trim()) {
      toast.error("Please enter province description");
      return;
    }

    if (!provinceToEdit) return;

    try {
      const formData = new FormData();

      const provinceData = {
        title: provinceTitle.trim(),
        description: provinceDescription.trim(),
      };

      formData.append("data", JSON.stringify(provinceData));

      if (provinceImages.length > 0) {
        provinceImages.forEach((image) => {
          formData.append("image", image);
        });
      }

      await editProvince({
        id: provinceToEdit._id,
        data: formData,
      }).unwrap();

      toast.success("Province updated successfully");
      setEditDialogOpen(false);
      setProvinceToEdit(null);
      setProvinceTitle("");
      setProvinceDescription("");
      setProvinceImages([]);
      setProvinceImagePreviews([]);
    } catch (error: unknown) {
      console.error("Update error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to update province");
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image should be less than 5MB");
        return;
      }
    }

    setProvinceImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProvinceImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setProvinceImages((prev) => prev.filter((_, i) => i !== index));
    setProvinceImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URL if it's a blob
      if (prev[index].startsWith("blob:")) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      provinceImagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [provinceImagePreviews]);

  const ImageUploadArea = ({ id }: { id: string }) => (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          id={id}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Drop your Images here or{" "}
            <span className="text-red-600 font-medium">Click to upload</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">You can upload multiple images</p>
        </label>
      </div>

      {provinceImagePreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {provinceImagePreviews.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                height={100}
                width={100}
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
                priority={false}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading provinces...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold">Error loading provinces</p>
            <p className="mt-2 text-gray-600">
              {error && "data" in error
                ? JSON.stringify(error.data)
                : "An error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Province List {meta.total > 0 && `(${meta.total})`}
        </h1>

        <div className="bg-white rounded-lg shadow">
          {/* Header with Add Button and Search */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={handleAddProvince}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Province
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search provinces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {provinces.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No provinces found</p>
                {debouncedSearchTerm && (
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your search term
                  </p>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Images
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {provinces.map((province, index) => (
                    <tr
                      key={province._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === provinces.length - 1 ? "border-b-0" : ""
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {province.image.slice(0, 3).map((img, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden"
                            >
                              <Image
                                src={
                                  getImageUrl(img) || "/placeholder-image.png"
                                }
                                alt={`${province.title} ${imgIndex + 1}`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                priority={false}
                              />
                            </div>
                          ))}
                          {province.image.length > 3 && (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                +{province.image.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {province.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {province.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(province.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleEditProvince(province)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(province._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && provinces.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                provinces
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 bg-white"
                >
                  Prev
                </Button>
                {Array.from({ length: meta.totalPage }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className={
                        currentPage === page
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-white"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(meta.totalPage, prev + 1))
                  }
                  disabled={currentPage === meta.totalPage || isLoading}
                  className="px-4 bg-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Province Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Province
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="province-title">
                Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="province-title"
                placeholder="Enter province title"
                value={provinceTitle}
                onChange={(e) => setProvinceTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province-description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="province-description"
                placeholder="Enter province description"
                value={provinceDescription}
                onChange={(e) => setProvinceDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Images <span className="text-red-600">*</span>
              </Label>
              <ImageUploadArea id="image-upload" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Province"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Province Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Province
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-province-title">
                Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="edit-province-title"
                placeholder="Enter province title"
                value={provinceTitle}
                onChange={(e) => setProvinceTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-province-description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="edit-province-description"
                placeholder="Enter province description"
                value={provinceDescription}
                onChange={(e) => setProvinceDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <ImageUploadArea id="edit-image-upload" />
              <p className="text-xs text-gray-500">
                Upload new images to replace existing ones
              </p>
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
              onClick={handleUpdate}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Province"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              province and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProvincePage;