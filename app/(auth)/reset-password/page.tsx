"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    password: string;
    confirmPassword: string;
  }>();

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password, confirmPassword: data.confirmPassword }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const json = await res.json();
        setError(json.error || "Reset failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {success ? (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Password Reset!</h2>
          <p className="text-gray-600 text-sm mt-2">Redirecting to sign in...</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Set New Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {!token && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                Invalid reset link. Please request a new one.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  {...register("password", { required: true, minLength: 8 })}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  {...register("confirmPassword", { required: true })}
                  placeholder="Repeat your new password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : "Reset Password"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary-700">Back to Sign In</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
            <span className="text-2xl font-bold text-primary-800">LR</span>
          </div>
          <h1 className="text-3xl font-bold text-white">LeelRa App</h1>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
