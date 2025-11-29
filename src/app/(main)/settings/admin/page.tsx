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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import CustomLoading from '../../../../components/Loading/CustomLoading';
import { useCreateAdminMutation, useDeleteAdminMutation, useEditAdminMutation, useGetAdminQuery } from '../../../../features/makeAdmin/makeAdminApi';

// Types
interface Admin {
  _id: string;
  full_name: string;
  role: string;
  email: string;
  createdAt: string;
  status: string;
  verified: boolean;
}

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
  status?: number;
}

interface UpdateAdminData {
  full_name: string;
  email: string;
  role: string;
  password?: string;
}

interface EditAdminParams {
  id: string;
  data: UpdateAdminData;
}

export default function AdminList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // API hooks
  const { data: adminData, isLoading, error, refetch } = useGetAdminQuery({});
  const [createAdmin, { isLoading: creatingAdminLoading }] = useCreateAdminMutation();
  const [editAdmin, { isLoading: updatingAdminLoading }] = useEditAdminMutation();
  const [deleteAdmin, { isLoading: deletingAdminLoading }] = useDeleteAdminMutation();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'ADMIN',
    password: ''
  });

  // Format date to display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get admins from API response
  const admins = adminData?.data?.users || [];

  const resetForm = (): void => {
    setFormData({ name: '', email: '', role: 'ADMIN', password: '' });
    setShowPassword(false);
    setSelectedAdmin(null);
  };

  const handleAddAdmin = async (): Promise<void> => {
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createAdmin({
        full_name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      }).unwrap();

      toast.success('Admin created successfully');
      setIsAddModalOpen(false);
      resetForm();
      refetch(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to create admin');
      console.error('Create admin error:', error);
    }
  };

  const handleEditClick = (admin: Admin): void => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.full_name,
      email: admin.email,
      role: admin.role,
      password: '' // Don't pre-fill password for security
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (): Promise<void> => {
    if (!formData.name || !formData.email || !formData.role || !selectedAdmin) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const updateData: UpdateAdminData = {
        full_name: formData.name,
        email: formData.email,
        role: formData.role
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const editParams: EditAdminParams = {
        id: selectedAdmin._id,
        data: updateData
      };

      await editAdmin(editParams).unwrap();

      toast.success('Admin updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      refetch(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to update admin');
      console.error('Update admin error:', error);
    }
  };

  const handleDeleteClick = (admin: Admin): void => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedAdmin) return;

    try {
      await deleteAdmin(selectedAdmin._id).unwrap();
      toast.success('Admin deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAdmin(null);
      refetch(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to delete admin');
      console.error('Delete admin error:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle API error
  useEffect(() => {
    if (error) {
      toast.error('Failed to load admins');
      console.error('Get admin error:', error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <>
        <CustomLoading />
      </>
    );
  }

  return (
    <div className="p-6">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin List</h1>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Total Admins: {admins.length}
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-700 hover:bg-red-800 text-white px-6"
              >
                + Add Admin
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Role</TableHead>
                    <TableHead className="font-semibold text-gray-900">Email</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Created Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin: Admin) => (
                      <TableRow key={admin._id}>
                        <TableCell className="text-gray-700">{admin.full_name}</TableCell>
                        <TableCell className="text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs ${admin.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {admin.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700">{admin.email}</TableCell>
                        <TableCell className="text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs ${admin.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {admin.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(admin.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(admin)}
                              className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                              disabled={admin.role === 'SUPER_ADMIN'} // Prevent editing super admin
                              title={admin.role === 'SUPER_ADMIN' ? 'Cannot edit Super Admin' : 'Edit Admin'}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(admin)}
                              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                              disabled={admin.role === 'SUPER_ADMIN'} // Prevent deleting super admin
                              title={admin.role === 'SUPER_ADMIN' ? 'Cannot delete Super Admin' : 'Delete Admin'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">
                Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-role">
                Role<span className="text-red-500">*</span>
              </Label>
              <select
                id="add-role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">
                Password<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="add-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddAdmin}
              disabled={creatingAdminLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white disabled:bg-gray-400"
            >
              {creatingAdminLoading ? 'Creating...' : 'Add Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">
                Role<span className="text-red-500">*</span>
              </Label>
              <select
                id="edit-role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password (leave empty to keep current)"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Leave password empty to keep current password</p>
            </div>

            <Button
              onClick={handleUpdateAdmin}
              disabled={updatingAdminLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white disabled:bg-gray-400"
            >
              {updatingAdminLoading ? 'Updating...' : 'Update Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedAdmin?.full_name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletingAdminLoading}
              className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400"
            >
              {deletingAdminLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}