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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Search, Store, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  useDeleteVendorsMutation,
  useGetAllVendorsQuery,
  useToggleVendorStatusMutation
} from '../../features/vendor/vendorApi';

type VendorData = {
  _id: string;
  name: string;
  owner: {
    _id: string;
    email: string;
    phone: string;
  } | null;
  address?: {
    province?: string;
    city?: string;
    territory?: string;
    country?: string;
    detail_address?: string;
  };
  isActive: boolean;
  phone: string;
  email: string;
};

const VendorList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [vendorToDelete, setVendorToDelete] = useState<VendorData | null>(null);
  const router = useRouter();

  const { data: allVendorData, isLoading, isError } = useGetAllVendorsQuery({});
  const [updateToggleStatus, { isLoading: isToggling }] = useToggleVendorStatusMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorsMutation();

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!allVendorData?.data) return [];

    return allVendorData.data.filter((vendor: VendorData) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.email.toLowerCase().includes(searchLower) ||
        vendor.phone.includes(searchTerm) ||
        (vendor.owner?.email?.toLowerCase().includes(searchLower))
      );
    });
  }, [allVendorData, searchTerm]);

  const toggleStatus = async (vendorId: string) => {
    try {
      await updateToggleStatus(vendorId).unwrap();
    } catch (error) {
      console.error('Failed to toggle vendor status:', error);
    }
  };

  const handleView = (vendorId: string) => {
    router.push(`/vendor/${vendorId}`);
  };

  const handleDeleteClick = (vendor: VendorData) => {
    setVendorToDelete(vendor);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      try {
        await deleteVendor(vendorToDelete._id).unwrap();
        console.log('Vendor deleted successfully');
      } catch (error) {
        console.error('Failed to delete vendor:', error);
      }
    }
    setDeleteModalOpen(false);
    setVendorToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setVendorToDelete(null);
  };

  const formatAddress = (address?: VendorData['address']) => {
    if (!address) return 'N/A';
    const parts = [
      address.detail_address,
      address.city,
      address.province,
      address.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !allVendorData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load vendors. Please try again.
        </div>
      </div>
    );
  }

  const pagination = allVendorData.pagination;
  const totalPages = pagination?.totalPage || 1;

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Vendor List ({pagination?.total || 0})
            </h1>

            <div className="flex items-center gap-3">
              <Select>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">Ontario</SelectItem>
                  <SelectItem value="qc">Quebec</SelectItem>
                  <SelectItem value="bc">British Columbia</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select Territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toronto">Toronto</SelectItem>
                  <SelectItem value="ottawa">Ottawa</SelectItem>
                  <SelectItem value="vancouver">Vancouver</SelectItem>
                </SelectContent>
              </Select>

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
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {filteredVendors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No vendors found matching your search.' : 'No vendors available.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-700">Store Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Owner Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Address</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor: VendorData) => (
                  <TableRow key={vendor._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Store className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">{vendor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {vendor.owner?.email || vendor.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {vendor.owner?.phone || vendor.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatAddress(vendor.address)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={vendor.isActive}
                        onCheckedChange={() => toggleStatus(vendor._id)}
                        disabled={isToggling}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-orange-500 text-orange-500 hover:bg-orange-50"
                          onClick={() => handleView(vendor._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteClick(vendor)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor
              {vendorToDelete && ` "${vendorToDelete.name}"`} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
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

export default VendorList;