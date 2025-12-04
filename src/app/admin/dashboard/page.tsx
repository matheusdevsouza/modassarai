'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
export default function AdminDashboardAliasPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && authenticated && user) {
        try {
          const response = await fetch('/api/admin/verificar-status');
          const data = await response.json();
          if (data.success && data.dbIsAdmin) {
            setIsAdminUser(true);
            router.replace('/admin');
          } else {
            setCheckingAdmin(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar status de admin:', error);
          setCheckingAdmin(false);
          return;
        }
      } else if (!loading && !authenticated) {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [loading, authenticated, user, router]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-transparent border-b-primary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    );
  }

  if (!authenticated || !isAdminUser) {
    return notFound();
  }

  return null;
}
