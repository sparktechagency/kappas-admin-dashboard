import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useCreateCategoryMutation } from '../../features/category/categoryApi';
import { CategoryOption, NewCategory } from './category';

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

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<NewCategory, 'image'> & { image: string }) => void;
  categoryOptions: CategoryOption[];
  subCategoryOptions: CategoryOption[];
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryOptions,
  subCategoryOptions,
}) => {
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    subCategory: '',
    image: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setNewCategory({ ...newCategory, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.subCategory) {
      try {
        // Create FormData object
        const formData = new FormData();

        // Create the data object with name and description
        const categoryData = {
          name: newCategory.name,
          description: newCategory.subCategory
        };

        // Append the data as JSON string
        formData.append('data', JSON.stringify(categoryData));

        // Append the image file if exists
        if (imageFile) {
          formData.append('thumbnail', imageFile);
        }

        // Call the API
        const response = await createCategory(formData).unwrap();

        console.log('Category created successfully:', response);

        // onClose();

        // You can add a success toast notification here
        alert('Category created successfully!');
      } catch (err: unknown) {
        console.error('Failed to create category:', err);

        // Proper error handling with type safety
        let errorMessage = 'Failed to create category. Please try again.';

        if (typeof err === 'object' && err !== null) {
          // Check if it's an API error with data
          const apiError = err as ApiError;
          if (apiError.data?.message) {
            errorMessage = apiError.data.message;
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }

          // Check if it's a serialized error from RTK Query
          const serializedError = err as SerializedError;
          if (serializedError.message) {
            errorMessage = serializedError.message;
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        alert(errorMessage);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className='w-full'>
            <Label htmlFor="category-name">Category Name</Label>
            <Select
              value={newCategory.name}
              onValueChange={(val) => setNewCategory({ ...newCategory, name: val })}
            >
              <SelectTrigger id="category-name" className="mt-2 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='w-full'>
            <Label htmlFor="sub-category-name">Sub-Category Name</Label>
            <Select
              value={newCategory.subCategory}
              onValueChange={(val) => setNewCategory({ ...newCategory, subCategory: val })}
            >
              <SelectTrigger id="sub-category-name" className="mt-2 w-full">
                <SelectValue placeholder="Select sub-category" />
              </SelectTrigger>
              <SelectContent>
                {subCategoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
              <input
                type="file"
                id="add-file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label htmlFor="add-file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG (Max 800*400px)</p>
                </div>
              </label>
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  height={100}
                  width={100}
                  className="mt-4 max-h-32 mx-auto rounded"
                />
              )}
            </div>
          </div>

          {isError && (
            <div className="text-red-500 text-sm">
              Error: {(error as ApiError)?.data?.message || 'Failed to create category'}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleAddCategory}
            disabled={isLoading || !newCategory.name || !newCategory.subCategory}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryModal;