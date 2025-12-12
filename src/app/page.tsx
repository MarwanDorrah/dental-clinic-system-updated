'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Mock authentication - replace with your API integration
    // Check if user is already logged in (e.g., check localStorage for token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      // User is authenticated, go to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, go to login
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
