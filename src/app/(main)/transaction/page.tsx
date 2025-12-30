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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CustomLoading from "../../../components/Loading/CustomLoading";
import {
  useDeleteTransactionMutation,
  useGetAllTransactionQuery,
} from "../../../features/transaction/transactionApi";

// Define types based on API response
type Transaction = {
  _id: string;
  method: string;
  status: string;
  transactionId: string;
  isDeleted: boolean;
  createdAt: string;
  amount?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
};

type FilterStatus = "default" | "paid" | "unpaid";

const TransactionTable = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  // Prepare status filter for API
  const statusFilter =
    filterStatus === "default"
      ? ""
      : filterStatus === "paid"
      ? "Paid"
      : "Unpaid";

  const {
    data: allTransactionData,
    isLoading: transactionLoading,
    isError: transactionError,
  } = useGetAllTransactionQuery({
    page: currentPage,
    limit: rowsPerPage,
    searchTerm: debouncedSearchTerm,
    status: statusFilter,
  });
  const [deleteTransaction] = useDeleteTransactionMutation();

  console.log("Transaction Data:", allTransactionData);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case "cod":
        return "Cash on Delivery";
      case "card":
        return "Credit/Debit Card";
      case "online":
        return "Online Payment";
      default:
        return method;
    }
  };

  // Format transaction ID - truncate after 15 characters
  const formatTransactionId = (transactionId: string) => {
    if (transactionId.length > 15) {
      return transactionId.substring(0, 15) + "...";
    }
    return transactionId;
  };

  // Get transactions and meta from API response
  const apiTransactions: Transaction[] =
    allTransactionData?.data?.payments || [];
  const meta = allTransactionData?.data?.meta || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };

  // Transform API data to include additional fields for display
  const transformedTransactions: Transaction[] = apiTransactions.map(
    (transaction) => ({
      ...transaction,
      amount: "$" + (Math.random() * 1000).toFixed(2), // You might want to get this from actual API
      customerName: `Customer ${transaction.transactionId.slice(-4)}`,
      customerEmail: `customer${transaction.transactionId.slice(
        -4
      )}@example.com`,
      description: `Payment via ${formatPaymentMethod(transaction.method)}`,
    })
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < meta.totalPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleView = (transactionId: string) => {
    const transaction = transformedTransactions.find(
      (t) => t.transactionId === transactionId
    );
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDetailsModalOpen(true);
    }
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTransaction) {
      try {
        console.log("Deleting transaction:", selectedTransaction.transactionId);
        await deleteTransaction(selectedTransaction._id).unwrap();
        setIsDeleteModalOpen(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTransaction(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTransaction(null);
  };

  if (transactionLoading) {
    return (
      <>
        <CustomLoading />
      </>
    );
  }

  if (transactionError) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading transactions</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Transaction
            </h1>
            <div className="flex items-center gap-4">
              <Select
                value={filterStatus}
                onValueChange={(value: FilterStatus) => {
                  setFilterStatus(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Transaction Id
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Payment Method
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No transactions found
                    {debouncedSearchTerm && (
                      <p className="text-gray-400 text-sm mt-2">
                        Try adjusting your search term
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                transformedTransactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-700">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell
                      className="text-gray-700 font-mono text-sm"
                      title={transaction.transactionId}
                    >
                      {formatTransactionId(transaction.transactionId)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatPaymentMethod(transaction.method)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          transaction.status === "Paid"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleView(transaction.transactionId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!transactionLoading && transformedTransactions.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value: string) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                disabled={transactionLoading}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {(meta.page - 1) * meta.limit + 1}-
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || transactionLoading}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={
                    currentPage === meta.totalPage || transactionLoading
                  }
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about the transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-gray-900">Date:</span>
                <span className="col-span-3 text-sm text-gray-700">
                  {formatDate(selectedTransaction.createdAt)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-gray-900">
                  Transaction ID:
                </span>
                <span className="col-span-3 text-sm text-gray-700 font-mono">
                  {formatTransactionId(selectedTransaction.transactionId)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-gray-900">
                  Payment Method:
                </span>
                <span className="col-span-3 text-sm text-gray-700">
                  {formatPaymentMethod(selectedTransaction.method)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-gray-900">
                  Status:
                </span>
                <span className="col-span-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                      selectedTransaction.status === "Paid"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {selectedTransaction.status}
                  </span>
                </span>
              </div>
              {selectedTransaction.amount && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    Amount:
                  </span>
                  <span className="col-span-3 text-sm text-gray-700">
                    {selectedTransaction.amount}
                  </span>
                </div>
              )}
              {selectedTransaction.customerName && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    Customer Name:
                  </span>
                  <span className="col-span-3 text-sm text-gray-700">
                    {selectedTransaction.customerName}
                  </span>
                </div>
              )}
              {selectedTransaction.customerEmail && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    Customer Email:
                  </span>
                  <span className="col-span-3 text-sm text-gray-700">
                    {selectedTransaction.customerEmail}
                  </span>
                </div>
              )}
              {selectedTransaction.description && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    Description:
                  </span>
                  <span className="col-span-3 text-sm text-gray-700">
                    {selectedTransaction.description}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={closeDetailsModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="w-full ">
          <AlertDialogHeader className="w-full">
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="w-full">
              This action cannot be undone. This will permanently delete the
              transaction
              {selectedTransaction &&
                ` with ID: ${formatTransactionId(
                  selectedTransaction.transactionId
                )}`}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteModal}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionTable;
