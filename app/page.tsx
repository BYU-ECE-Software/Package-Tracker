import PackageDashboard from '@/components/dashboard/PackageDashboard';
import PageTitle from '@/components/layout/pageTitle';

export default function Home() {
  return (
    <>
      <PageTitle title="MAIL DASHBOARD" />
      <PackageDashboard />
    </>
  );
}