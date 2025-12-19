import AdminDashboard from '@/components/PackageDashboard';
import FooterBar from '@/components/footer';
import HeaderBar from '@/components/header';
import PageTitle from '@/components/pageTitle';

export default function Home() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="MAIL DASHBOARD" />
      <AdminDashboard />
      <FooterBar />
    </>
  );
}
