import React from "react";
import { ITransaction } from './types';


interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ITransaction | null;
  isLoading: boolean;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  isLoading,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    return status === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "Online":
        return "bg-blue-100 text-blue-800";
      case "Card":
        return "bg-purple-100 text-purple-800";
      case "Cod":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {transaction.transactionId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Intent</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {transaction.paymentIntent || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Method</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(transaction.method)}`}>
                    {transaction.method}
                  </span>
                </div>
                {transaction.amount && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              {/* User Information */}
              {transaction.user && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.user.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.user.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop Information */}
              {transaction.shop && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Shop Name</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.shop.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.shop.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{transaction.shop.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Information */}
              {transaction.order && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.order}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No transaction data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;