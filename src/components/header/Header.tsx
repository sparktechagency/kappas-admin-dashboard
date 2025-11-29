"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetAllNotificationsQuery, useReadSingleNotificationMutation } from '../../features/notifications/notifications';
import { useGetProfileQuery } from '../../features/profile/profileApi';
import { baseURL } from '../../utils/BaseURL';

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

export default function MainlandHeader() {
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: profileResponse } = useGetProfileQuery({});
  const { data: notificationsResponse, isLoading: notificationsLoading } = useGetAllNotificationsQuery({});
  const [readSingleNotification] = useReadSingleNotificationMutation();

  const profileData = profileResponse?.data;
  const notifications: Notification[] = notificationsResponse?.data?.result || [];

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const handleMyProfile = () => {
    router.push("/settings/profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsDropdownOpen(false);
    router.push("/auth/login");
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await readSingleNotification(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationItemClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      handleMarkAsRead(notificationId);
    }
    // Optionally, you can navigate to a specific notification page here
    // or perform any other action when a notification is clicked
  };

  const avatarSrc = (() => {
    if (!profileData?.image) return null;

    // If DB saved base64 → do NOT add baseURL
    if (profileData.image.startsWith("data:")) {
      return profileData.image;
    }

    // If image starts with "/" → do NOT add baseURL
    if (profileData.image.startsWith("/")) {
      return profileData.image;
    }

    // Otherwise → add baseURL
    return baseURL + profileData.image;
  })();




  return (
    <div className="w-full border-b bg-white">
      <header className="flex h-16 items-center justify-end px-6 gap-3">
        {/* Globe Icon */}
        {/*  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <Globe className="h-5 w-5 text-gray-600" />
        </button> */}

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationClick}
            className="relative flex cursor-pointer items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={notificationsLoading}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold bg-red-500 hover:bg-red-500 border-2 border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {notificationsLoading ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                <>
                  <div className="overflow-y-auto flex-1">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationItemClick(notification._id, notification.read)}
                        className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''
                          }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500 text-white text-xs font-semibold">
                          {notification.title?.charAt(0) || 'N'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-semibold text-gray-900">
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-1 inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              )}
                            </h4>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification._id);
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-700 mt-1 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        router.push("/notifications");
                      }}
                      className="w-full text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium py-2 text-center transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* User Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Avatar className="h-10 w-10 ring-2 ring-teal-500">
              <AvatarImage src={baseURL + avatarSrc || "/default-avatar.png"} alt={profileData?.full_name} />
              <AvatarFallback className="bg-teal-500 text-white font-semibold text-sm">
                {profileData?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">
                {profileData?.full_name || 'User'}
              </span>
              <span className="text-xs text-gray-500">{profileData?.role || 'Admin'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
              <button
                onClick={handleMyProfile}
                className="flex w-full px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                My Profile
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex w-full px-4 py-2 text-sm cursor-pointer text-red-600 hover:bg-gray-50 transition-colors text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}