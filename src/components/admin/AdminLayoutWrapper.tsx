'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from './AdminLayout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders without the admin sidebar/nav chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
