'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
export default function AdminDashboardAliasPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && authenticated && user?.is_admin) {
      router.replace('/admin');
    }
  }, [loading, authenticated, user, router]);
  if (!authenticated || !user?.is_admin) {
    return notFound();
  }
  return null;
}
