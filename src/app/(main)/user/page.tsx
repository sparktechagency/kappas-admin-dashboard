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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import CustomLoading from "../../../components/Loading/CustomLoading";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateStatusByUserMutation,
} from "../../../features/users/usersApi";

// Types
interface User {
  _id: string;
  full_name: string;
  phone: string;
  address?: {
    address?: string;
    city?: string;
    post?: number;
  };
  business_informations: string[];
  status: string;
}

interface QueryParams {
  status?: string;
  isRecentUsers?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

interface UserStatusUpdate {
  id: string;
  data: {
    status: string;
  };
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, debouncedSearchTerm]);

  // Prepare query parameters
  const queryParams: QueryParams = {
    page: currentPage,
    limit: 10,
  };

  if (selectedFilter === "active") {
    queryParams.status = "active";
  } else if (selectedFilter === "inactive") {
    queryParams.status = "blocked";
  } else if (selectedFilter === "recent") {
    queryParams.isRecentUsers = "true";
  }

  if (debouncedSearchTerm) {
    queryParams.searchTerm = debouncedSearchTerm;
  }

  // API Hooks
  const { data, isLoading, error, refetch } = useGetAllUsersQuery(queryParams);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateStatusByUserMutation();

  const users = data?.data?.users || [];
  const meta = data?.data?.meta || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    try {
      setUpdatingUserId(userId);
      const newStatus = currentStatus === "active" ? "blocked" : "active";

      console.log(
        "Updating user:",
        userId,
        "from",
        currentStatus,
        "to",
        newStatus
      );

      const updateData: UserStatusUpdate = {
        id: userId,
        data: { status: newStatus },
      };

      const result = await updateStatus(updateData).unwrap();

      console.log("Update successful:", result);

      // Refetch the data to get updated user list
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
      // You can add toast notification here
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete).unwrap();
        console.log("User deleted successfully");
        // Refetch the data to get updated user list
        refetch();
      } catch (error) {
        console.error("Failed to delete user:", error);
        // You can add toast notification here
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatAddress = (user: User) => {
    if (!user.address) return "N/A";
    const { address, city, post } = user.address;
    return [address, city, post].filter(Boolean).join(", ") || "N/A";
  };

  return (
    <div className="w-full p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              User Management
            </h1>

            <div className="flex items-center gap-3">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Blocked Users</SelectItem>
                  <SelectItem value="recent">Recent Users</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 w-[280px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <>
              <CustomLoading />
            </>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">
                Failed to load users. Please try again.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Order Count
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
                {users.map((user: User, index: number) => (
                  <tr
                    key={user._id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index === users.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatAddress(user)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.business_informations?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === "active"}
                          onCheckedChange={() =>
                            toggleStatus(user._id, user.status)
                          }
                          disabled={
                            isUpdatingStatus && updatingUserId === user._id
                          }
                          className="data-[state=checked]:bg-green-500"
                        />
                        {isUpdatingStatus && updatingUserId === user._id && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-red-300 text-red-500 hover:bg-red-50 bg-red-50"
                        onClick={() => handleDelete(user._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        {!isLoading && users.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(meta.page - 1) * meta.limit + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
              users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
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
                    disabled={isLoading}
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
                disabled={currentPage === meta.totalPage || isLoading}
                className="px-4 bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
