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
import { Edit, Plus, Search, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetAllBrandQuery,
  useUpdateCetgoryMutation,
} from "../../../features/brand/brandApi";
import { baseURL } from "../../../utils/BaseURL";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
    result: Brand[];
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const BrandList = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [limit] = useState<number>(10);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState<string>("");
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [brandImagePreview, setBrandImagePreview] = useState<string | null>(
    null
  );
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
  const { data, isLoading, isError, error } = useGetAllBrandQuery({
    page: currentPage,
    limit: limit,
    searchTerm: debouncedSearchTerm,
  });

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateCetgoryMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  // Extract brands from API response
  const apiData = data as BrandApiResponse | undefined;

  // Memoize brands to fix the useMemo dependency warning
  const brands = useMemo(
    () => apiData?.data?.result || [],
    [apiData?.data?.result]
  );
  const meta = apiData?.data?.meta || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };

  // Safe image URL helper
  const getImageUrl = (logo: string) => {
    if (!logo) return null;
    // Only prepend baseURL if it's a relative path and we're on client
    if (isClient && !logo.startsWith("http") && !logo.startsWith("blob:")) {
      return baseURL + logo;
    }
    return logo;
  };

  const handleAddBrand = () => {
    setBrandName("");
    setBrandImage(null);
    setBrandImagePreview(null);
    setAddDialogOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setBrandToEdit(brand);
    setBrandName(brand.name);
    setBrandImage(null);
    const imageUrl = getImageUrl(brand.logo);
    setBrandImagePreview(imageUrl);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (brandId: string) => {
    setBrandToDelete(brandId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    try {
      await deleteBrand(brandToDelete).unwrap();
      toast.success("Brand deleted successfully");
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to delete brand");
    }
  };

  const handleCreate = async () => {
    if (!brandName.trim()) {
      toast.error("Please enter brand name");
      return;
    }

    if (!brandImage) {
      toast.error("Please upload brand logo");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add the data as JSON string - only name for brand
      const brandData = {
        name: brandName.trim(),
      };

      formData.append("data", JSON.stringify(brandData));
      formData.append("logo", brandImage);

      await createBrand(formData).unwrap();
      toast.success("Brand created successfully");
      setAddDialogOpen(false);
      setBrandName("");
      setBrandImage(null);
      setBrandImagePreview(null);
    } catch (error: unknown) {
      console.error("Create error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to create brand");
    }
  };

  const handleUpdate = async () => {
    if (!brandName.trim()) {
      toast.error("Please enter brand name");
      return;
    }

    if (!brandToEdit) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();

      const brandData = {
        name: brandName.trim(),
      };

      formData.append("data", JSON.stringify(brandData));

      // Only append logo if a new image was selected
      if (brandImage) {
        formData.append("logo", brandImage);
      }

      await updateBrand({
        id: brandToEdit._id,
        data: formData,
      }).unwrap();

      toast.success("Brand updated successfully");
      setEditDialogOpen(false);
      setBrandToEdit(null);
      setBrandName("");
      setBrandImage(null);
      setBrandImagePreview(null);
    } catch (error: unknown) {
      console.error("Update error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to update brand");
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setBrandImage(file);
      const imageUrl = URL.createObjectURL(file);
      setBrandImagePreview(imageUrl);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (brandImagePreview && brandImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(brandImagePreview);
      }
    };
  }, [brandImagePreview]);

  const ImageUploadArea = ({
    id,
    imageUrl,
  }: {
    id: string;
    imageUrl: string | null;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
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
                alt="Brand preview"
                className="w-32 h-32 object-cover rounded-lg"
                priority={false}
              />
            </div>
            <p className="text-sm text-gray-600">Click to change image</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-gray-900" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Drop your Image here or{" "}
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading brands...</p>
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
            <p className="text-red-600 font-semibold">Error loading brands</p>
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
          Brand List {meta.total > 0 && `(${meta.total})`}
        </h1>

        <div className="bg-white rounded-lg shadow">
          {/* Header with Add Button and Search */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={handleAddBrand}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {brands.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No brands found</p>
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
                      Logo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Brand Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Status
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
                  {brands.map((brand, index) => (
                    <tr
                      key={brand._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index === brands.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {brand.logo ? (
                            <Image
                              src={
                                getImageUrl(brand.logo) ||
                                "/placeholder-image.png"
                              }
                              alt={brand.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              priority={false}
                            />
                          ) : (
                            <span className="text-xl">🏷️</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {brand.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(brand._id)}
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
          {!isLoading && brands.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                brands
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

      {/* Add Brand Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Brand
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">
                Brand Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="brand-name"
                placeholder="Enter brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Brand Logo <span className="text-red-600">*</span>
              </Label>
              <ImageUploadArea id="image-upload" imageUrl={brandImagePreview} />
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
              {isCreating ? "Creating..." : "Create Brand"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Brand
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand-name">
                Brand Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="edit-brand-name"
                placeholder="Enter brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand Logo</Label>
              <ImageUploadArea
                id="edit-image-upload"
                imageUrl={brandImagePreview}
              />
              <p className="text-xs text-gray-500">
                Leave empty to keep current logo
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
              {isUpdating ? "Updating..." : "Update Brand"}
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
              brand and remove its data from the system.
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

export default BrandList;
