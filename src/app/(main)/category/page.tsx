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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import CustomLoading from '../../../components/Loading/CustomLoading';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
  useUpdateCategoryMutation
} from '../../../features/category/categoryApi';
import { baseURL } from '../../../utils/BaseURL';
import toast from 'react-hot-toast';

interface SubCategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  thumbnail: string;
  image?: string[];
  createdBy: string;
  subCategory: SubCategory[];
  description: string;
  status: string;
  isDeleted: boolean;
  ctgViewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
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

const CategoryList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [bannerImagePreviews, setBannerImagePreviews] = useState<string[]>([]);
  const [existingBannerImages, setExistingBannerImages] = useState<string[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Cleanup all blob URLs
  const cleanupBlobUrls = () => {
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    bannerImagePreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    return cleanupBlobUrls;
  }, []);

  // API Hooks
  const { data, isLoading, isError, error } = useGetAllCategoryQuery({
    page: currentPage,
    limit: 10,
    searchTerm: searchTerm,
  });

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Extract categories from API response
  const apiData = data as ApiResponse | undefined;

  // Memoize categories to fix the useMemo dependency warning
  const categories = useMemo(() => apiData?.data?.categorys || [], [apiData?.data?.categorys]);
  const meta = apiData?.data?.meta;

  // Client-side filtering as fallback - only on client side
  const filteredCategories = useMemo(() => {
    if (!isClient) return categories;
    if (!searchTerm) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm, isClient]);

  // Safe image URL helper
  const getImageUrl = (thumbnail: string) => {
    if (!thumbnail) return null;
    if (isClient && !thumbnail.startsWith('http') && !thumbnail.startsWith('blob:')) {
      return baseURL + thumbnail;
    }
    return thumbnail;
  };

  const resetAllStates = () => {
    cleanupBlobUrls();
    setCategoryName('');
    setCategoryImage(null);
    setCategoryImagePreview(null);
    setBannerImages([]);
    setBannerImagePreviews([]);
    setExistingBannerImages([]);
    setCategoryToEdit(null);
  };

  const handleAddCategory = () => {
    resetAllStates();
    setAddDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    resetAllStates();

    setCategoryToEdit(category);
    setCategoryName(category.name);

    // Load existing thumbnail preview
    if (category.thumbnail) {
      const imageUrl = getImageUrl(category.thumbnail);
      setCategoryImagePreview(imageUrl);
    }

    // Load existing banner images
    if (category.image && category.image.length > 0) {
      const bannerUrls = category.image
        .map(img => getImageUrl(img))
        .filter((url): url is string => url !== null);

      setExistingBannerImages(bannerUrls);
    }
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await deleteCategory(categoryToDelete).unwrap();
      toast.success(response.message || 'Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to delete category');
    }
  };

  const handlePublish = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }

    if (!categoryImage) {
      toast.error('Please upload category image');
      return;
    }

    try {
      const formData = new FormData();

      const categoryData = {
        name: categoryName.trim(),
        description: categoryName.trim(),
      };

      formData.append('data', JSON.stringify(categoryData));
      formData.append('thumbnail', categoryImage);

      // Add multiple banner images - use 'bannerImages' as key if backend expects it
      bannerImages.forEach((image, index) => {
        formData.append(`image`, image);
      });

      const response = await createCategory(formData).unwrap();
      toast.success(response.message || 'Category created successfully');
      setAddDialogOpen(false);
      resetAllStates();
    } catch (error: unknown) {
      console.error('Create error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }

    if (!categoryToEdit) return;

    try {
      const formData = new FormData();

      const categoryData = {
        name: categoryName.trim(),
        description: categoryName.trim(),
        // Include existing banner images that haven't been removed
        existingBannerImages: existingBannerImages.map(url => {
          // Extract just the filename from the full URL
          return url.replace(baseURL, '');
        })
      };

      formData.append('data', JSON.stringify(categoryData));

      // Only append thumbnail if a new image was selected
      if (categoryImage) {
        formData.append('thumbnail', categoryImage);
      }

      // Add new banner images if any
      bannerImages.forEach((image) => {
        formData.append('image', image);
      });

      const response = await updateCategory({
        id: categoryToEdit._id,
        data: formData
      }).unwrap();
      toast.success(response.message || 'Category updated successfully');
      setEditDialogOpen(false);
      resetAllStates();
    } catch (error: unknown) {
      console.error('Update error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to update category');
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(`Image size should be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Cleanup previous blob URL if exists
    if (categoryImagePreview && categoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(categoryImagePreview);
    }

    setCategoryImage(file);
    const imageUrl = URL.createObjectURL(file);
    setCategoryImagePreview(imageUrl);

    // Clear the input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleBannerImagesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is larger than 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length === 0) return;

    setBannerImages(prev => [...prev, ...validFiles]);
    setBannerImagePreviews(prev => [...prev, ...newPreviews]);

    // Clear the input value
    e.target.value = '';
  };

  const removeBannerImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Remove from existing banners
      const newExisting = [...existingBannerImages];
      const urlToRevoke = newExisting[index];
      newExisting.splice(index, 1);
      setExistingBannerImages(newExisting);
    } else {
      // Remove from newly uploaded banners
      setBannerImages(prev => prev.filter((_, i) => i !== index));

      const urlToRevoke = bannerImagePreviews[index];
      if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRevoke);
      }

      setBannerImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeExistingBannerImage = (index: number) => {
    removeBannerImage(index, true);
  };

  // Image Upload Component
  const ImageUploadArea = ({
    id,
    imageUrl,
    label = "Category Image"
  }: {
    id: string;
    imageUrl: string | null;
    label?: string;
  }) => (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-red-600">*</span>
      </Label>
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
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={imageUrl}
                    alt="Category preview"
                    fill
                    className="object-cover rounded-lg"
                    sizes="128px"
                    priority={false}
                  />
                </div>
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
    </div>
  );

  // Banner Images Upload Component
  const BannerImagesUploadArea = ({
    id,
    existingPreviews = [],
    newPreviews = []
  }: {
    id: string;
    existingPreviews?: string[];
    newPreviews?: string[];
  }) => {
    const allPreviews = [...existingPreviews, ...newPreviews];

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Category Banner Images</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              id={id}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleBannerImagesUpload}
            />
            <label
              htmlFor={id}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-900" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Drop your Images here or{' '}
                <span className="text-red-600 font-medium">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">You can select multiple images</p>
            </label>
          </div>
        </div>

        {(allPreviews.length > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Banner Previews:</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Existing banner images */}
              {existingPreviews.map((preview, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <div className="relative w-full h-24">
                    <Image
                      src={preview}
                      alt={`Existing Banner ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 200px) 100vw, 200px"
                      priority={false}
                    />
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => removeExistingBannerImage(index)}
                      className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Newly uploaded banner images */}
              {newPreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="relative w-full h-24">
                    <Image
                      src={preview}
                      alt={`New Banner ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 200px) 100vw, 200px"
                      priority={false}
                    />
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => removeBannerImage(index)}
                      className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return <CustomLoading />;
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold">Error loading categories</p>
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Category List</h1>
        <div className="bg-white rounded-lg shadow">
          {/* Header with Add Button and Search */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={handleAddCategory}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No categories found</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Icon</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Banner Images</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Category Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Sub Categories</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={category._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === filteredCategories.length - 1 ? 'border-b-0' : ''
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {category.thumbnail ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={getImageUrl(category.thumbnail) || '/placeholder-image.png'}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                priority={false}
                              />
                            </div>
                          ) : (
                            <span className="text-xl">📁</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {category.image && category.image.length > 0 ? (
                            category.image.slice(0, 3).map((banner, idx) => (
                              <div key={idx} className="relative w-8 h-8 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={getImageUrl(banner) || '/placeholder-image.png'}
                                  alt={`Banner ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                  priority={false}
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No banners</span>
                          )}
                          {category.image && category.image.length > 3 && (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{category.image.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {category.subCategory?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(category._id)}
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
          {meta && meta.totalPage > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 bg-white"
              >
                Prev
              </Button>
              {Array.from({ length: meta.totalPage }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white"
                  }
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(meta.totalPage, prev + 1))}
                disabled={currentPage === meta.totalPage}
                className="px-4 bg-white"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="Enter Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <ImageUploadArea
              id="image-upload"
              imageUrl={categoryImagePreview}
              label="Category Image"
            />

            <BannerImagesUploadArea
              id="banner-upload"
              newPreviews={bannerImagePreviews}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                resetAllStates();
              }}
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white"
              disabled={isCreating}
            >
              {isCreating ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">
                Category Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="edit-category-name"
                placeholder="Enter Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <ImageUploadArea
              id="edit-image-upload"
              imageUrl={categoryImagePreview}
              label="Category Image"
            />

            <BannerImagesUploadArea
              id="edit-banner-upload"
              existingPreviews={existingBannerImages}
              newPreviews={bannerImagePreviews}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                resetAllStates();
              }}
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
              {isUpdating ? 'Updating...' : 'Update'}
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
              This action cannot be undone. This will permanently delete the category
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryList;