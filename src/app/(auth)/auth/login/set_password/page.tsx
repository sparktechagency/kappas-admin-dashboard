"use client";

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../../../../../features/auth/authApi';

interface Errors {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  token: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
  status?: number;
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({
    newPassword: '',
    confirmPassword: ''
  });
  const [apiError, setApiError] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Get token from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      setToken(tokenFromUrl);
    }
  }, []);

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (): Promise<void> => {
    const newErrors: Errors = { newPassword: '', confirmPassword: '' };
    setApiError('');

    // Check if token exists
    if (!token) {
      setApiError('Reset token is missing. Please use the link from your email.');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // If there are validation errors, don't proceed
    if (newErrors.newPassword || newErrors.confirmPassword) {
      return;
    }

    try {
      const resetData: ResetPasswordData = {
        password: newPassword,
        confirmPassword: confirmPassword,
        token: token
      };

      const response = await resetPassword(resetData).unwrap();

      console.log('Success:', response);

      // Show success message and redirect to login
      toast.success('Password reset successful! You can now log in with your new password.');
      router.push('/auth/login');

    } catch (error: unknown) {
      console.error('Error:', error);

      // Handle specific error messages with proper type casting
      const apiError = error as ApiError;

      if (apiError?.data?.message) {
        setApiError(apiError.data.message);
      } else if (apiError?.status === 401) {
        setApiError('Invalid or expired token. Please request a new password reset link.');
      } else {
        setApiError('An error occurred. Please try again.');
      }
    }
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewPassword(e.target.value);
    if (errors.newPassword) {
      setErrors({ ...errors, newPassword: '' });
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const toggleShowNewPassword = (): void => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-[#fef5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#b82e2e] mb-3">Reset Password</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please set a new password to secure your account and regain access
          </p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        {/* Loading state while getting token */}
        {!token && typeof window !== 'undefined' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-600">Loading...</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-2">
              Password*
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="Create a password"
                className={`w-full px-4 py-2.5 pr-10 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all text-sm`}
              />
              <button
                type="button"
                onClick={toggleShowNewPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
              Confirm New Password*
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Re-enter your new password"
                className={`w-full px-4 py-2.5 pr-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all text-sm`}
              />
              <button
                type="button"
                onClick={toggleShowConfirmPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !token}
            className="w-full bg-[#b82e2e] hover:bg-[#8b2323] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}