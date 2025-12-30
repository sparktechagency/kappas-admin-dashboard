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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Search, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useGetAllCategoryQuery } from "../../../features/category/categoryApi";
import {
  useCreateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useGetAllSubCategoryQuery,
  useUpdateSubcategoryMutation,
} from "../../../features/subCategory/subCategoryApi";
import { baseURL } from "../../../utils/BaseURL";

interface SubCategory {
  _id: string;
  name: string;
  thumbnail: string;
  description: string;
  categoryId: {
    _id: string;
    name: string;
  };
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  variantFieldsNames: string[];
}

interface Category {
  _id: string;
  name: string;
  thumbnail: string;
  createdBy: string;
  subCategory: SubCategory[];
  description: string;
  status: string;
  isDeleted: boolean;
  ctgViewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SubCategoryApiResponse {
  success: boolean;
  message: string;
  data: {
    meta?: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
    subCategorys: SubCategory[];
  };
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
    categorys: Category[];
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const SubCategoryList = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [limit] = useState<number>(10);

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(
    null
  );
  const [subCategoryToEdit, setSubCategoryToEdit] =
    useState<SubCategory | null>(null);

  // Form states
  const [subCategoryName, setSubCategoryName] = useState<string>("");
  const [subCategoryDescription, setSubCategoryDescription] =
    useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subCategoryImage, setSubCategoryImage] = useState<File | null>(null);
  const [subCategoryImagePreview, setSubCategoryImagePreview] = useState<
    string | null
  >(null);
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
  const { data: categoryData } = useGetAllCategoryQuery({
    page: currentPage,
    limit: 100, // Increased limit to get all categories for dropdown
    searchTerm: "",
  });

  console.log("Category :", categoryData);

  const {
    data: subCategoryData,
    isLoading: subCategoryLoading,
    isError: subCategoryIsError,
    error: subCategoryError,
  } = useGetAllSubCategoryQuery({
    page: currentPage,
    limit: limit,
    searchTerm: debouncedSearchTerm,
  });

  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubcategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubcategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubcategoryMutation();

  // Extract data from API responses
  const categoryApiData = categoryData as CategoryApiResponse | undefined;
  const subCategoryApiData = subCategoryData as
    | SubCategoryApiResponse
    | undefined;

  // Memoize data
  const categories = useMemo(
    () => categoryApiData?.data?.categorys || [],
    [categoryApiData?.data?.categorys]
  );
  const subCategories = useMemo(
    () => subCategoryApiData?.data?.subCategorys || [],
    [subCategoryApiData?.data?.subCategorys]
  );
  const meta = subCategoryApiData?.data?.meta || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };

  // Safe image URL helper
  const getImageUrl = (thumbnail: string) => {
    if (!thumbnail) return null;
    if (
      isClient &&
      !thumbnail.startsWith("http") &&
      !thumbnail.startsWith("blob:")
    ) {
      return baseURL + thumbnail;
    }
    return thumbnail;
  };

  // Reset form function
  const resetForm = () => {
    setSubCategoryName("");
    setSubCategoryDescription("");
    setSelectedCategoryId("");
    setSubCategoryImage(null);
    setSubCategoryImagePreview(null);
  };

  const handleAddSubCategory = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSubCategoryToEdit(subCategory);
    setSubCategoryName(subCategory.name);
    setSubCategoryDescription(subCategory.description);
    setSelectedCategoryId(subCategory.categoryId._id);
    setSubCategoryImage(null);
    const imageUrl = getImageUrl(subCategory.thumbnail);
    setSubCategoryImagePreview(imageUrl);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (subCategoryId: string) => {
    setSubCategoryToDelete(subCategoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subCategoryToDelete) return;

    try {
      await deleteSubCategory(subCategoryToDelete).unwrap();
      toast.success("Sub category deleted successfully");
      setDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
    } catch (error: unknown) {
      console.error("Delete error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to delete sub category");
    }
  };

  const handleCreate = async () => {
    if (!subCategoryName.trim()) {
      toast.error("Please enter sub category name");
      return;
    }

    if (!subCategoryDescription.trim()) {
      toast.error("Please enter sub category description");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!subCategoryImage) {
      toast.error("Please upload sub category image");
      return;
    }

    try {
      const formData = new FormData();
      const subCategoryData = {
        name: subCategoryName.trim(),
        description: subCategoryDescription.trim(),
        categoryId: selectedCategoryId,
      };

      formData.append("data", JSON.stringify(subCategoryData));
      formData.append("thumbnail", subCategoryImage);

      await createSubCategory(formData).unwrap();
      toast.success("Sub category created successfully");
      setAddDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Create error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to create sub category");
    }
  };

  const handleUpdate = async () => {
    if (!subCategoryName.trim()) {
      toast.error("Please enter sub category name");
      return;
    }

    if (!subCategoryDescription.trim()) {
      toast.error("Please enter sub category description");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!subCategoryToEdit) return;

    try {
      const formData = new FormData();
      const subCategoryData = {
        name: subCategoryName.trim(),
        description: subCategoryDescription.trim(),
        categoryId: selectedCategoryId,
      };

      formData.append("data", JSON.stringify(subCategoryData));

      if (subCategoryImage) {
        formData.append("thumbnail", subCategoryImage);
      }

      await updateSubCategory({
        id: subCategoryToEdit._id,
        data: formData,
      }).unwrap();

      toast.success("Sub category updated successfully");
      setEditDialogOpen(false);
      setSubCategoryToEdit(null);
      resetForm();
    } catch (error: unknown) {
      console.error("Update error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to update sub category");
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSubCategoryImage(file);
      const imageUrl = URL.createObjectURL(file);
      setSubCategoryImagePreview(imageUrl);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (
        subCategoryImagePreview &&
        subCategoryImagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(subCategoryImagePreview);
      }
    };
  }, [subCategoryImagePreview]);

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
                alt="Sub category preview"
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
  if (subCategoryLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading sub categories...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (subCategoryIsError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold">
              Error loading sub categories
            </p>
            <p className="mt-2 text-gray-600">
              {subCategoryError && "data" in subCategoryError
                ? JSON.stringify(subCategoryError.data)
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
          Sub Category List {meta.total > 0 && `(${meta.total})`}
        </h1>

        <div className="bg-white rounded-lg shadow">
          {/* Header with Add Button and Search */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={handleAddSubCategory}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sub Category
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search sub categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {subCategories.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No sub categories found</p>
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
                      Icon
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Sub Category Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Parent Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {subCategories.map((subCategory, index) => (
                    <tr
                      key={subCategory._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index === subCategories.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {subCategory.thumbnail ? (
                            <Image
                              src={
                                getImageUrl(subCategory.thumbnail) ||
                                "/placeholder-image.png"
                              }
                              alt={subCategory.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              priority={false}
                            />
                          ) : (
                            <span className="text-xl">📁</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {subCategory.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {subCategory.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {subCategory.categoryId.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subCategory.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subCategory.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleEditSubCategory(subCategory)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(subCategory._id)}
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

          {/* Pagination Section */}
          {!subCategoryLoading && subCategories.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                sub categories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || subCategoryLoading}
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
                      disabled={subCategoryLoading}
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
                  disabled={
                    currentPage === meta.totalPage || subCategoryLoading
                  }
                  className="px-4 bg-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Sub Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Sub Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="category-select">
                Parent Category <span className="text-red-600">*</span>
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory-name">
                Sub Category Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="subcategory-name"
                placeholder="Enter sub category name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory-description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="subcategory-description"
                placeholder="Enter sub category description"
                value={subCategoryDescription}
                onChange={(e) => setSubCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Sub Category Image <span className="text-red-600">*</span>
              </Label>
              <ImageUploadArea
                id="image-upload"
                imageUrl={subCategoryImagePreview}
              />
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
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sub Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Sub Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="edit-category-select">
                Parent Category <span className="text-red-600">*</span>
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-name">
                Sub Category Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="edit-subcategory-name"
                placeholder="Enter sub category name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="edit-subcategory-description"
                placeholder="Enter sub category description"
                value={subCategoryDescription}
                onChange={(e) => setSubCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Sub Category Image</Label>
              <ImageUploadArea
                id="edit-image-upload"
                imageUrl={subCategoryImagePreview}
              />
              <p className="text-xs text-gray-500">
                Leave empty to keep current image
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
              {isUpdating ? "Updating..." : "Update"}
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
              This action cannot be undone. This will permanently delete the sub
              category and remove its data from the system.
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

export default SubCategoryList;
