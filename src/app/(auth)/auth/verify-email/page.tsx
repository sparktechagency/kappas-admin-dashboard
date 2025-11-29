"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(57);
  const [canResend, setCanResend] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleChange = (index: number, value: string): void => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = (): void => {
    setError('');

    const otpValue = otp.join('');

    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert(`OTP ${otpValue} has been verified successfully!`);
      router.push('/auth/reset-password');
    }, 1500);
  };

  const handleResend = (): void => {
    if (!canResend) return;

    setOtp(['', '', '', '']);
    setError('');
    setCountdown(57);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    alert('A new OTP has been sent to your email');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#fef5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#b82e2e] mb-3">Verify OTP</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enter your OTP which has been sent to your email and completely verify your account.
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input Fields */}
          <div>
            <div className="flex justify-center gap-3 mb-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={setInputRef(index)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-16 h-16 text-center text-2xl font-semibold border-2 rounded-lg ${error
                      ? 'border-red-500'
                      : digit
                        ? 'border-[#b82e2e]'
                        : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#b82e2e] focus:border-transparent transition-all`}
                />
              ))}
            </div>
            {error && (
              <p className="text-center text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              A code has been sent to your email
            </p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-[#b82e2e] hover:text-[#8b2323] font-medium transition-colors"
              >
                Resend
              </button>
            ) : (
              <p className="text-sm font-medium">
                <span className="text-gray-700">Resend in </span>
                <span className="text-[#b82e2e]">{formatTime(countdown)}</span>
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#b82e2e] hover:bg-[#8b2323] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}