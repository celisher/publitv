import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
