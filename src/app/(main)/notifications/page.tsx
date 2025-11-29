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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useDeleteAllNotificationMutation,
  useDeleteSingleNotificationMutation,
  useGetAllNotificationsQuery,
  useReadAllNotificationMutation,
  useReadSingleNotificationMutation
} from '../../../features/notifications/notifications';

interface Notification {
  _id: string;
  message: string;
  title: string;
  receiver: string;
  read: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}



function getAvatarInfo(type: string, title: string) {
  const typeMap: { [key: string]: { avatar: string; color: string } } = {
    MESSAGE: { avatar: 'M', color: 'bg-blue-500' },
    ORDER: { avatar: 'O', color: 'bg-green-500' },
    PAYMENT: { avatar: 'P', color: 'bg-purple-500' },
    ALERT: { avatar: 'A', color: 'bg-orange-500' },
    SYSTEM: { avatar: 'S', color: 'bg-gray-500' },
    USER: { avatar: 'U', color: 'bg-teal-500' },
  };

  return typeMap[type] || { avatar: title.charAt(0), color: 'bg-gray-500' };
}

function formatTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  return created.toLocaleDateString();
}

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // API hooks
  const { data: notificationsData, isLoading, error } = useGetAllNotificationsQuery({});



  const [readSingleNotification] = useReadSingleNotificationMutation();
  const [readAllNotification] = useReadAllNotificationMutation();
  const [deleteSingleNotification] = useDeleteSingleNotificationMutation();
  const [deleteAllNotification] = useDeleteAllNotificationMutation();

  const notifications: Notification[] = notificationsData?.data?.result || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await readSingleNotification(id).unwrap();
      toast.success(response.message || 'Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await readAllNotification({}).unwrap();
      toast.success(response.message || 'All notifications marked as read');
      console.log(response)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await deleteSingleNotification(id).unwrap();
      console.log('Delete notification response:', response);
      toast.success(response.message || 'Notification deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const response = await deleteAllNotification({}).unwrap();
      console.log('Delete all read notifications response:', response);
      toast.success(response.message || 'All read notifications deleted successfully');
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleDeleteClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAllClick = () => {
    setDeleteAllDialogOpen(true);
  };

  const filteredNotifications = selectedTab === 'all'
    ? notifications
    : selectedTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Bell className="w-16 h-16 text-gray-300 mb-4 animate-bounce" />
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Bell className="w-16 h-16 text-red-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading notifications</h3>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">You have {unreadCount} unread notifications</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteAllClick}
              disabled={notifications.filter(n => n.read).length === 0}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear read
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-white border">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                {unreadCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="read" className="gap-2">
              Read
              <Badge variant="secondary" className="ml-1">
                {notifications.filter(n => n.read).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const { avatar, color } = getAvatarInfo(notification.type, notification.title);

                return (
                  <Card
                    key={notification._id}
                    className={`transition-all hover:shadow-md ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className={`${color} text-white`}>
                          <AvatarFallback className={`${color} text-white`}>
                            {avatar}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* More Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(notification)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Single Notification Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNotification && deleteNotification(selectedNotification._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Read Notifications Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Read Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all read notifications? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAllRead}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}