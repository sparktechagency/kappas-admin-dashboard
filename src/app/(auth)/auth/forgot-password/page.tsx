"use client";

import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useForgotEmailMutation } from '../../../../features/auth/authApi';

interface ErrorResponse {
  data?: {
    message?: string;
  };
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [forgetEmail, { isLoading }] = useForgotEmailMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (): Promise<void> => {
    setError('');

    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await forgetEmail({ email }).unwrap();
      console.log(response);
      setIsSuccess(true);
      toast.success('OTP sent successfully');
      window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
    } catch (error: unknown) {
      console.log('Error:', error);
      const apiError = error as ErrorResponse;
      setError(apiError?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-[#fef5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#b82e2e] mb-3">Forgot Password</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enter the email associated with your account and we&apos;ll send you OTP to reset your password
          </p>
        </div>

        <div className="space-y-6">
          {/* Email or Phone Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email or Phone
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
              placeholder="Ex. Johndoe@gmail.com"
              className={`w-full px-4 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all text-sm`}
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
            className="w-full bg-[#b82e2e] hover:bg-[#8b2323] cursor-pointer text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Sending...' : isSuccess ? 'OTP Sent!' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}