"use client";

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TipTapEditor from '../../../../TipTapEditor/TipTapEditor';
import { useCreateTermsAndConditionMutation, useGetTermAndCondtionQuery } from '../../../../features/cms/cmsApi';

const TermsCondition = () => {
  const [content, setContent] = useState<string>('');
  const [editorKey, setEditorKey] = useState<number>(0); // Key to force editor re-render

  // Fetch terms and conditions data
  const { data, isLoading: isFetching } = useGetTermAndCondtionQuery({});
  const [createTermsAndCondition, { isLoading: isUpdating }] = useCreateTermsAndConditionMutation();

  // Load data from API into editor when data is available
  useEffect(() => {
    if (data?.data) {
      setContent(data.data);
      setEditorKey(prev => prev + 1); // Force editor to re-render with new content
    }
  }, [data]);

  const isContentEmpty = (htmlContent: string): boolean => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  };

  const handleUpdate = async () => {
    if (isContentEmpty(content)) {
      alert('Please add some content before updating.');
      return;
    }

    try {
      const response = await createTermsAndCondition({
        termsOfService: content
      }).unwrap();

      console.log(response)

      if (response.success) {
        toast.success(response.message || 'Terms and Conditions updated successfully!');
      }
    } catch (error) {
      console.error('Error updating terms and conditions:', error);
      toast.error('Failed to update terms and conditions. Please try again.');
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleCancel = () => {
    // Reset to original data
    if (data?.data) {
      setContent(data.data);
      setEditorKey(prev => prev + 1); // Force editor to reload original content
    }
  };

  if (isFetching) {
    return (
      <div className='max-w-5xl space-y-1 p-6'>
        <h1 className='text-2xl font-medium'>Terms and Conditions</h1>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-5xl space-y-1 p-6'>
      <h1 className='text-2xl font-medium'>Terms and Conditions</h1>

      <div className="flex-1 overflow-hidden">
        <TipTapEditor
          key={editorKey} // Force re-render when key changes
          content={content}
          onChange={handleContentChange}
          placeholder="Write your terms and conditions here..."
        />
      </div>

      <div className='flex justify-end w-full gap-2'>
        <div className='w-4/12 flex gap-5'>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isContentEmpty(content) || isUpdating}
            className="flex-1"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsCondition;