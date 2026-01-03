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
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetAllFaqQuery,
  useUpdateFaqMutation,
} from '../../../features/faq/faqApi';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  type: 'for_seller' | 'for_website';
  createdAt: string;
  updatedAt: string;
}

interface FAQApiResponse {
  success: boolean;
  message: string;
  data: {
    faqs: FAQ[];
    meta: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'for_seller' | 'for_website'>('for_website');
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [faqToEdit, setFaqToEdit] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset current page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // API Hooks
  const { data, isLoading, isError, error, refetch } = useGetAllFaqQuery({
    page: currentPage,
    limit: 10,
    type: activeTab,
  });

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  // Extract FAQs from API response
  const apiData = data as FAQApiResponse | undefined;

  // Memoize FAQs to fix the useMemo dependency warning
  const faqs = useMemo(() => apiData?.data?.faqs || [], [apiData?.data?.faqs]);
  const meta = apiData?.data?.meta;

  // Client-side filtering as fallback - only on client side
  const filteredFaqs = useMemo(() => {
    if (!isClient) return faqs;
    if (!searchTerm) return faqs;

    return faqs.filter((faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqs, searchTerm, isClient]);

  // Reset form function
  const resetForm = () => {
    setQuestion('');
    setAnswer('');
  };

  const handleAddFaq = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setFaqToEdit(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (faqId: string) => {
    setFaqToDelete(faqId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      await deleteFaq(faqToDelete).unwrap();
      toast.success('FAQ deleted successfully');
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
      refetch();
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleCreate = async () => {
    if (!question.trim()) {
      toast.error('Please enter question');
      return;
    }

    if (!answer.trim()) {
      toast.error('Please enter answer');
      return;
    }

    try {
      const faqData = {
        question: question.trim(),
        answer: answer.trim(),
        type: activeTab, // Automatically use the current active tab type
      };

      await createFaq(faqData).unwrap();
      toast.success('FAQ created successfully');
      setAddDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: unknown) {
      console.error('Create error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to create FAQ');
    }
  };

  const handleUpdate = async () => {
    if (!question.trim()) {
      toast.error('Please enter question');
      return;
    }

    if (!answer.trim()) {
      toast.error('Please enter answer');
      return;
    }

    if (!faqToEdit) return;

    try {
      const faqData = {
        question: question.trim(),
        answer: answer.trim(),
        type: faqToEdit.type, // Keep the original type when updating
      };

      await updateFaq({
        id: faqToEdit._id,
        data: faqData
      }).unwrap();

      toast.success('FAQ updated successfully');
      setEditDialogOpen(false);
      setFaqToEdit(null);
      resetForm();
      refetch();
    } catch (error: unknown) {
      console.error('Update error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to update FAQ');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading FAQs...</p>
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
            <p className="text-red-600 font-semibold">Error loading FAQs</p>
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">FAQ Management</h1>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('for_website')}
                  className={`py-4 px-1 cursor-pointer border-b-2 font-medium text-sm ${activeTab === 'for_website'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Website FAQs
                </button>
                <button
                  onClick={() => setActiveTab('for_seller')}
                  className={`py-4 px-1 cursor-pointer border-b-2 font-medium text-sm ${activeTab === 'for_seller'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Seller FAQs
                </button>
              </div>
            </div>
          </div>

          {/* Header with Add Button and Search */}
          <div className="p-6 flex items-center justify-between">
            <Button
              onClick={handleAddFaq}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No FAQs found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm ? 'Try adjusting your search term' : `No ${activeTab === 'for_website' ? 'website' : 'seller'} FAQs available`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Question</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Answer</th>


                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredFaqs.map((faq, index) => (
                    <tr
                      key={faq._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === filteredFaqs.length - 1 ? 'border-b-0' : ''
                        }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="font-medium">{faq.question}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="line-clamp-2">{faq.answer}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleEditFaq(faq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-300 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(faq._id)}
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

      {/* Add FAQ Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add FAQ - {activeTab === 'for_website' ? 'Website' : 'Seller'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">
                Question <span className="text-red-600">*</span>
              </Label>
              <Input
                id="question"
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">
                Answer <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="answer"
                placeholder="Enter answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                This FAQ will be added to <strong>{activeTab === 'for_website' ? 'Website' : 'Seller'}</strong> section
              </p>
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
              {isCreating ? 'Creating...' : 'Create FAQ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">
                Question <span className="text-red-600">*</span>
              </Label>
              <Input
                id="edit-question"
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-answer">
                Answer <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="edit-answer"
                placeholder="Enter answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Type: <strong>{faqToEdit?.type === 'for_website' ? 'Website' : 'Seller'}</strong>
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
              {isUpdating ? 'Updating...' : 'Update FAQ'}
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
              This action cannot be undone. This will permanently delete the FAQ
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

export default FAQPage;