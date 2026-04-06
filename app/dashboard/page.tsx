'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    // Redirect based on role
    const dashboardMap: Record<string, string> = {
      student: '/dashboard/student',
      company: '/dashboard/company',
      coordinator: '/dashboard/coordinator',
    };

    const destination = dashboardMap[user.role];
    if (destination) {
      router.push(destination);
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
