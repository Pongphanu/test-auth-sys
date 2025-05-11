// components/AuthWrapper.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getCookie } from 'cookies-next';

export default function AuthWrapper({ children, requireAuth = true }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    const token = getCookie('token');
    
    // If authentication is required but user is not authenticated, redirect to sign-in
    if (requireAuth && !isAuthenticated && !token) {
      router.replace('/');
    }
    
    // If user is authenticated but this is a non-authenticated route (like sign-in/sign-up), redirect to landing
    if (!requireAuth && (isAuthenticated || token)) {
      router.replace('/landing');
    }
  }, [isAuthenticated, requireAuth, router]);

  return <>{children}</>;
}