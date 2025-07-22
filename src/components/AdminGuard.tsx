"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // Redirect non-admin users to home page
      router.push("/home");
    }
  }, [isAdmin, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9.5a2.5 2.5 0 00-5 0V12m0 0v3m0-3h5"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => router.push("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    );
  }

  // Render children if user is admin
  return <>{children}</>;
}
