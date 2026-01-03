"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RefreshCw, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  useCreateBannerMutation,
  useGetAllBannerQuery,
} from "../../features/banner/banner";
import { baseURL } from "../../utils/BaseURL";
import toast from 'react-hot-toast';

interface BannerApiResponse {
  success: boolean;
  message: string;
  data: {
    banner: string[];
    logo: string;
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
}

function Banner() {
  const [replaceDialogOpen, setReplaceDialogOpen] = useState<boolean>(false);
  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [bannerImagePreviews, setBannerImagePreviews] = useState<string[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log whenever bannerImages changes
  useEffect(() => {
    console.log("=== bannerImages State Changed ===");
    console.log("Current count:", bannerImages.length);
    console.log(
      "File names:",
      bannerImages.map((f, i) => `${i + 1}. ${f.name} (${f.size} bytes)`)
    );
    console.log("Preview count:", bannerImagePreviews.length);
    if (bannerImages.length !== bannerImagePreviews.length) {
      console.error("⚠️ MISMATCH DETECTED!");
    }
  }, [bannerImages, bannerImagePreviews]);

  // API Hooks
  const { data, isLoading, isError, error } = useGetAllBannerQuery({});
  const [createBanner, { isLoading: isReplacing }] = useCreateBannerMutation();

  // Extract banners from API response
  const apiData = data as BannerApiResponse | undefined;
  const banners = useMemo(
    () => apiData?.data?.banner || [],
    [apiData?.data?.banner]
  );

  // Safe image URL helper
  const getImageUrl = (image: string) => {
    if (!image) return null;
    // Only prepend baseURL if it's a relative path and we're on client
    if (isClient && !image.startsWith("http") && !image.startsWith("blob:")) {
      return baseURL + image;
    }
    return image;
  };

  const openReplaceDialog = () => {
    setBannerImages([]);
    setBannerImagePreviews([]);
    setReplaceDialogOpen(true);
  };

  const handleReplaceAll = async () => {
    if (bannerImages.length === 0) {
      toast.error("Please upload at least one banner image");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Ensure we have the same number of files as previews
      if (bannerImages.length !== bannerImagePreviews.length) {
        console.error("Mismatch detected:", {
          files: bannerImages.length,
          previews: bannerImagePreviews.length,
        });
        toast.error("Error: File count mismatch. Please try uploading again.");
        return;
      }

      console.log("=== API Upload Started ===");
      console.log("Total files to upload:", bannerImages.length);
      console.log(
        "Files:",
        bannerImages.map(
          (f, i) =>
            `${i + 1}. ${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`
        )
      );

      // Append all images
      let appendedCount = 0;
      bannerImages.forEach((file, index) => {
        console.log(
          `Appending file ${index + 1}/${bannerImages.length}:`,
          file.name,
          `(${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );
        formData.append("banner", file);
        appendedCount++;
      });

      console.log(`✓ Successfully appended ${appendedCount} files to FormData`);

      // Verify FormData (note: FormData.entries() is not always available, but we can check the count)
      if (appendedCount !== bannerImages.length) {
        console.error("⚠️ MISMATCH: Not all files were appended!");
        console.error(
          `Expected: ${bannerImages.length}, Appended: ${appendedCount}`
        );
        toast.error(
          `Error: Only ${appendedCount} of ${bannerImages.length} files were prepared for upload.`
        );
        return;
      }

      await createBanner(formData).unwrap();
      toast.success("All banners replaced successfully");
      setReplaceDialogOpen(false);
      setBannerImages([]);
      setBannerImagePreviews([]);
    } catch (error: unknown) {
      console.error("Replace error:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || "Failed to replace banners");
    }
  };

  const handleMultipleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    console.log("=== File Upload Started ===");
    console.log("Total files selected:", files.length);
    console.log("Current files in state:", bannerImages.length);

    if (files.length === 0) {
      console.log("No files selected");
      return;
    }

    // Check if adding new files would exceed the maximum of 10
    const currentCount = bannerImages.length;
    const maxFiles = 10;

    if (currentCount + files.length > maxFiles) {
      toast.error(
        `Maximum ${maxFiles} files allowed. You can upload ${
          maxFiles - currentCount
        } more file(s).`
      );
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    const rejectedFiles: { name: string; reason: string }[] = [];

    files.forEach((file, index) => {
      console.log(`Processing file ${index + 1}/${files.length}:`, file.name, {
        type: file.type,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      });

      // Validate file type - only JPG and PNG
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type.toLowerCase())) {
        const reason = `Invalid file type: ${file.type}`;
        console.warn(`Rejected ${file.name}:`, reason);
        rejectedFiles.push({ name: file.name, reason });
        toast.error(
          `${file.name} is not a valid file. Only JPG and PNG are allowed.`
        );
        return;
      }

      // Validate file size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        const reason = `File too large: ${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB`;
        console.warn(`Rejected ${file.name}:`, reason);
        rejectedFiles.push({ name: file.name, reason });
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // File passed validation
      validFiles.push(file);
      const imageUrl = URL.createObjectURL(file);
      validPreviews.push(imageUrl);
      console.log(`✓ Accepted ${file.name}`);
    });

    console.log("=== Validation Summary ===");
    console.log("Total files:", files.length);
    console.log("Valid files:", validFiles.length);
    console.log("Rejected files:", rejectedFiles.length);
    if (rejectedFiles.length > 0) {
      console.log("Rejected files details:", rejectedFiles);
    }

    if (validFiles.length > 0) {
      // Double check we don't exceed the limit after validation
      const totalAfterAdd = currentCount + validFiles.length;
      if (totalAfterAdd > maxFiles) {
        toast.error(
          `Maximum ${maxFiles} files allowed. Please remove some files first.`
        );
        return;
      }

      // Ensure validFiles and validPreviews have the same length
      if (validFiles.length !== validPreviews.length) {
        console.error(
          "Mismatch: validFiles and validPreviews have different lengths",
          { validFiles: validFiles.length, validPreviews: validPreviews.length }
        );
        // Clean up any preview URLs that were created
        validPreviews.forEach((preview) => {
          if (preview?.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
          }
        });
        toast.error("Error processing files. Please try again.");
        return;
      }

      // Update both states atomically using the same previous state reference
      // This ensures they stay in sync
      setBannerImages((prevFiles) => {
        const newFiles = [...prevFiles, ...validFiles];
        console.log("=== State Update: bannerImages ===");
        console.log("Previous count:", prevFiles.length);
        console.log("Adding:", validFiles.length);
        console.log("New total:", newFiles.length);
        console.log(
          "File names:",
          newFiles.map((f) => f.name)
        );
        return newFiles;
      });
      setBannerImagePreviews((prevPreviews) => {
        const newPreviews = [...prevPreviews, ...validPreviews];
        console.log("=== State Update: bannerImagePreviews ===");
        console.log("Previous count:", prevPreviews.length);
        console.log("Adding:", validPreviews.length);
        console.log("New total:", newPreviews.length);
        return newPreviews;
      });
    } else {
      console.warn("No valid files to add after validation");
    }

    // Reset the input value to allow selecting the same files again
    e.target.value = "";
    console.log("=== File Upload Completed ===");
  };

  const removeImage = (index: number) => {
    // Revoke the object URL
    if (bannerImagePreviews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerImagePreviews[index]);
    }

    setBannerImages((prev) => prev.filter((_, i) => i !== index));
    setBannerImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      bannerImagePreviews.forEach((preview) => {
        if (preview?.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [bannerImagePreviews]);

  const MultipleImageUploadArea = ({
    id,
    images,
    previews,
    onRemove,
  }: {
    id: string;
    images: File[];
    previews: string[];
    onRemove: (index: number) => void;
  }) => {
    const maxFiles = 10;
    const isMaxReached = images.length >= maxFiles;

    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            isMaxReached ? "border-gray-200 bg-gray-50" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            id={id}
            className="hidden"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={handleMultipleImageUpload}
            disabled={isMaxReached}
          />
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center ${
              isMaxReached ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-gray-900" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Drop your Images here or{" "}
              <span className="text-red-600 font-medium">Click to upload</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Only JPG and PNG allowed (Maximum {maxFiles} files)
            </p>
            {isMaxReached && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                Maximum limit reached. Remove files to add more.
              </p>
            )}
          </label>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {previews.map((preview, index) => {
              const file = images[index];
              // Use file name + index as key to ensure uniqueness
              const uniqueKey = file
                ? `${file.name}-${file.size}-${index}`
                : `preview-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className="relative border rounded-lg overflow-hidden"
                >
                  <Image
                    height={200}
                    width={200}
                    src={preview}
                    alt={`Banner preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                    priority={false}
                  />
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 p-2 truncate">
                    {file?.name || `Image ${index + 1}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading banners...</p>
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
            <p className="text-red-600 font-semibold">Error loading banners</p>
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
          Banner Management
        </h1>

        <div className="bg-white rounded-lg shadow">
          {/* Header with Replace All Button */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={openReplaceDialog}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Replace All Banners
            </Button>
          </div>

          {/* Banners Grid */}
          <div className="p-6">
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No banners found. Add your first banner!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((bannerPath, index) => {
                  const imageUrl = getImageUrl(bannerPath);
                  return (
                    <div
                      key={`${bannerPath}-${index}`}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {imageUrl && (
                        <div className="relative w-full h-48">
                          <Image
                            src={imageUrl}
                            alt="Banner"
                            fill
                            className="object-cover"
                            priority={false}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replace All Banners Dialog */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Replace All Banners</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Banner Images (Maximum 10 files - JPG and PNG only)</Label>
              {bannerImages.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {bannerImages.length} of 10 files selected
                </p>
              )}
              <div className="mt-2">
                <MultipleImageUploadArea
                  id="replace-all-banner-upload"
                  images={bannerImages}
                  previews={bannerImagePreviews}
                  onRemove={removeImage}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setReplaceDialogOpen(false);
                setBannerImages([]);
                setBannerImagePreviews([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReplaceAll}
              disabled={isReplacing || bannerImages.length === 0}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              {isReplacing
                ? "Replacing..."
                : `Replace All (${bannerImages.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Banner;
