'use client';

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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Mail, Package, Phone, Search, Store, Trash2, TrendingUp, User } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { useDeleteProductMutation, useGetStoreDetailsQuery, useGetStoreProductQuery, useGetStoreStateQuery } from '../../../../features/vendor/vendorApi';
import { baseURL } from '../../../../utils/BaseURL';

// Types based on API response
interface StoreOwner {
  _id: string;
  email?: string;
  phone?: string;
  name?: string;
  // Add other owner fields as needed
}

interface StoreDetails {
  _id: string;
  name: string;
  phone: string;
  email: string;
  owner: StoreOwner | string | null;
  address?: {
    province: string;
    city: string;
    territory: string;
    country: string;
    detail_address: string;
  };
  logo?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  settings?: {
    allowChat: boolean;
    autoAcceptOrders: boolean;
  };
  isActive: boolean;
  revenue?: number;
  totalFollowers?: number;
  totalReviews?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

interface StoreStats {
  totalOrders: number;
  totalEarnings: number;
}

interface StoreProduct {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  totalStock: number;
  images: string[];
  categoryId: {
    _id: string;
    name: string;
  };
  purchaseCount: number;
  createdAt: string;
  avg_rating: number;
  totalReviews: number;
  tags: string[];
  isFeatured: boolean;
}



export default function StoreInfoPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const itemsPerPage = 10;
  const router = useRouter();
  const { id } = useParams();

  // API calls
  const { data: storeDetailsData, isLoading: storeDetailsLoading, isError: storeDetailsError } = useGetStoreDetailsQuery(id as string);
  const { data: storeStatsData, isLoading: storeStatsLoading, isError: storeStatsError } = useGetStoreStateQuery(id as string);
  const { data: storeProductsData, isLoading: storeProductsLoading, isError: storeProductsError } = useGetStoreProductQuery(id as string);
  const [deleteProduct, { isLoading: deleteProductLoading }] = useDeleteProductMutation();

  // Extract data from API responses
  const storeDetails: StoreDetails | null = storeDetailsData?.data || null;
  const storeStats: StoreStats | null = storeStatsData?.data || null;
  const storeProducts: StoreProduct[] = storeProductsData?.data || [];


  // Helper function to get owner name safely
  const getOwnerName = (owner: StoreOwner | string | null): string => {
    if (!owner) return 'Not specified';
    if (typeof owner === 'string') return owner;
    return owner.name || owner.email || 'Not specified';
  };


  // Filter products based on search
  const filteredProducts = storeProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categoryId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when searching
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Delete handlers
  const handleDeleteClick = (product: StoreProduct) => {
    console.log('Delete clicked for:', product);
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct._id).unwrap();
        // The invalidatesTags in the API will automatically refetch the data
        console.log('Product deleted successfully');
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading states
  if (storeDetailsLoading || storeStatsLoading || storeProductsLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg">Loading store information...</div>
      </div>
    );
  }

  // Error states
  if (storeDetailsError || storeStatsError || storeProductsError) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">Error loading store information</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Store Info Section */} <button onClick={() => window.history.back()} className='border px-5 py-1 rounded bg-red-100 cursor-pointer text-gray-500'>Back</button>

        <Card className='p-0'>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Store className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Store info</h2>
            </div>

            <div className="flex items-start gap-6">
              {/* Store Logo */}
              <div className="">
                <Image
                  src={
                    storeDetails?.logo && baseURL
                      ? `${baseURL.replace(/\/$/, '')}/${storeDetails.logo.replace(/^\//, '')}`
                      : "/icons/Border.png"
                  }
                  height={100}
                  width={100}
                  className='w-full h-full rounded-lg object-cover'
                  alt={`${storeDetails?.name || 'Store'} logo`}
                />
              </div>

              {/* Store Details */}
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{storeDetails?.name || 'Store Name'}</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Owner:</span>
                    <span>{getOwnerName(storeDetails?.owner || null)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Phone:</span>
                    <span>{storeDetails?.phone || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email:</span>
                    <span>{storeDetails?.email || 'Not specified'}</span>
                  </div>

                  {/* Additional store info from API */}
                  {storeDetails?.revenue !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Revenue:</span>
                      <span>${storeDetails.revenue}</span>
                    </div>
                  )}

                  {storeDetails?.rating !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Rating:</span>
                      <span>{storeDetails.rating} ⭐ ({storeDetails.totalReviews || 0} reviews)</span>
                    </div>
                  )}

                  {storeDetails?.totalFollowers !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Followers:</span>
                      <span>{storeDetails.totalFollowers}</span>
                    </div>
                  )}

                  {storeDetails?.isActive !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${storeDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {storeDetails.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Order</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {storeStats?.totalOrders ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earning</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{storeStats?.totalEarnings ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product List Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Product List ({storeProducts.length} products)
              </h2>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-900">Product Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Product ID</TableHead>
                    <TableHead className="font-semibold text-gray-900">Category</TableHead>
                    <TableHead className="font-semibold text-gray-900">Price</TableHead>
                    <TableHead className="font-semibold text-gray-900">Sold</TableHead>
                    <TableHead className="font-semibold text-gray-900">Stock</TableHead>
                    <TableHead className="font-semibold text-gray-900">Publish Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="text-gray-700 font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-700 text-sm">#{product._id.slice(-8)}</TableCell>
                        <TableCell className="text-gray-700">{product.categoryId.name}</TableCell>
                        <TableCell className="text-gray-700 font-semibold">${product.basePrice}</TableCell>
                        <TableCell className="text-gray-700">{product.purchaseCount}</TableCell>
                        <TableCell className="text-gray-700">{product.totalStock}</TableCell>
                        <TableCell className="text-gray-700">{formatDate(product.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => router.push(`/vendor/${id}/${product._id}`)}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                              disabled={deleteProductLoading}
                              className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        {storeProducts.length === 0 ? 'No products found for this store' : 'No products match your search'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedProduct?.name}</span> (#{selectedProduct?._id.slice(-8)})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductLoading}
            >
              {deleteProductLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}