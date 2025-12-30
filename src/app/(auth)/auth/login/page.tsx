"use client";


import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../../../../features/auth/authApi';
import { saveToken } from '../../../../utils/storage';

interface Errors {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    accessToken: string;
  };
}

interface DecodedToken {
  id: string;
  role: string;
  email: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({
    email: '',
    password: ''
  });

  const router = useRouter();
  const [loginAuth, { isLoading }] = useLoginMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const decodeJWT = (token: string): DecodedToken | null => {
    try {
      // JWT token has 3 parts: header.payload.signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const newErrors: Errors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // If there are validation errors, don't proceed with API call
    if (newErrors.email || newErrors.password) {
      return;
    }

    try {
      const response = await loginAuth({ email, password }).unwrap() as LoginResponse;
      console.log(response);

      const accessToken = response?.data?.accessToken;

      if (accessToken) {
        // Decode the token to get user information
        const decodedToken = decodeJWT(accessToken);

        if (decodedToken && decodedToken.id) {
          // Store admin ID in localStorage
          localStorage.setItem('adminloginId', decodedToken.id);
          console.log('Admin ID stored:', decodedToken.id);
        } else {
          console.error('Could not decode token or missing ID');
        }

        // // Set cookie with proper options
        // Cookies.set("adminToken", accessToken, {
        //   expires: rememberMe ? 7 : 1, // 7 days if remember me is checked, otherwise 1 day
        //   sameSite: "strict",
        //   secure: process.env.NODE_ENV === 'production',
        // });

        saveToken(accessToken);

        toast.success('Login successful');
        router.push('/');
      } else {
        throw new Error('No access token received');
      }

    } catch (error: unknown) {
      console.log('Login error:', error);
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleRememberMeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRememberMe(e.target.checked);
  };

  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  //jsdfjj

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef5f0] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#b82e2e] mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-500">
            Log in to continue shopping and enjoy personalized offers
          </p>
        </div>

        <div className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email address"
              className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all text-sm`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter Password"
                className={`w-full px-4 py-2.5 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all text-sm`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="w-4 h-4 text-[#b82e2e] bg-gray-100 border-gray-300 rounded focus:ring-[#b82e2e] focus:ring-2"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#b82e2e] hover:text-[#8b2323] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#b82e2e] cursor-pointer hover:bg-[#8b2323] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}