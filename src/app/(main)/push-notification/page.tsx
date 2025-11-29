'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent, useState } from 'react';

import toast from 'react-hot-toast';
import { useCreatepushNotificationsMutation } from '../../../features/pushNotifications/PushNotificationsApi';

interface FormData {
  title: string;
  message: string;
  sendTo: string;
}

// Error handling interfaces
interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
  status?: number;
}

interface SerializedError {
  message?: string;
  code?: string;
  name?: string;
}

// Map frontend audience values to backend topic values
const audienceToTopicMap: Record<string, string> = {
  'all-users': 'USER',
  'active-users': 'USER',
  'premium-users': 'USER',
  'new-users': 'USER',
  'inactive-users': 'USER',
};

export default function PushNotificationSender() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    message: '',
    sendTo: ''
  });

  const [createpushNotifications, { isLoading: isCreating }] = useCreatepushNotificationsMutation();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.sendTo) {
      toast.error('Please select a target audience');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    try {
      // Prepare the data for API - exactly matching your API structure
      const notificationData = {
        topic: audienceToTopicMap[formData.sendTo] || 'USER',
        title: formData.title.trim(),
        body: formData.message.trim(),
      };

      console.log('Sending notification:', notificationData);

      // Call the API
      const response = await createpushNotifications(notificationData).unwrap();

      // Handle success
      toast.success(response.message || 'Push notification sent successfully!');
      console.log('Notification response:', response);

      // Reset form
      setFormData({
        title: '',
        message: '',
        sendTo: ''
      });

    } catch (error: unknown) {
      console.error('Failed to send notification:', error);

      // More detailed error handling with proper type checking
      let errorMessage = 'Failed to send push notification. Please try again.';

      if (typeof error === 'object' && error !== null) {
        // Check if it's an API error with data
        const apiError = error as ApiError;
        if (apiError.data?.message) {
          errorMessage = apiError.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        // Check if it's a serialized error from RTK Query
        const serializedError = error as SerializedError;
        if (serializedError.message) {
          errorMessage = serializedError.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    }
  };

  const audiences = [
    { label: 'All Users', value: 'all-users' },
    { label: 'Active Users', value: 'active-users' },
    { label: 'Premium Users', value: 'premium-users' },
    { label: 'New Users', value: 'new-users' },
    { label: 'Inactive Users', value: 'inactive-users' }
  ];

  return (
    <div className="p-6">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Send push notifications</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                    Title<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter Title"
                    className="h-10"
                    disabled={isCreating}
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-semibold text-gray-900">
                    Message<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter Message"
                    className="min-h-[120px] resize-none"
                    disabled={isCreating}
                  />
                </div>

                {/* Send To Field */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="sendTo" className="text-base font-semibold text-gray-900">
                    Send To <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.sendTo}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, sendTo: value }))}
                    disabled={isCreating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendNotification}
                  className="w-full h-12 bg-red-700 hover:bg-red-800 text-white text-base font-medium mt-8"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Push Notification'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <div className="relative">
                {/* iPhone Frame */}
                <div className="w-[280px] h-[580px] bg-black rounded-[50px] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-[40px] overflow-hidden">
                    {/* Time */}
                    <div className="text-white text-5xl font-light text-center pt-12">
                      12:07
                    </div>

                    {/* Notification Card */}
                    <div className="mx-4 mt-8">
                      <div className="bg-gray-100 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-start gap-3">
                          {/* App Icon */}
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600">kapp</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                              {formData.title || 'Title'}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {formData.message || 'Message Body'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-30"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}