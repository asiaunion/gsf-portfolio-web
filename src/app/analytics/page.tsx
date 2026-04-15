import { fetchAssetData } from '@/lib/data';
import ClientAnalytics from '@/components/ClientAnalytics';

export const revalidate = 60;

export default async function AnalyticsPage() {
  const { assets } = await fetchAssetData();

  return (
    <main className="page-container">
      <ClientAnalytics assets={assets} />
    </main>
  );
}
