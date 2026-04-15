import { fetchAssetData, Asset } from '@/lib/data';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function PortfolioPage() {
  const { assets, isDelayed, errors } = await fetchAssetData();

  // Aggregate
  let totalAssets = 0;
  let totalDebt = 0;

  assets.forEach(a => {
    if (a.isDebt) {
      totalDebt += a.loan > 0 ? a.loan : a.valueKRW;
    } else {
      totalAssets += a.valueKRW;
      totalDebt += a.loan;
    }
  });

  const netWorth = totalAssets - totalDebt;

  // Grouping
  const groups: Record<string, Asset[]> = {};
  assets.forEach(a => {
    const key = a.bigCategory;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });

  const formatKRW = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num)) + '원';
  };

  const getSubtotal = (cat: string) => {
    if (!groups[cat]) return 0;
    return groups[cat].reduce((sum, i) => sum + (i.isDebt || i.category.includes('대출') ? (i.loan > 0 ? i.loan : i.valueKRW) : i.valueKRW), 0);
  };

  return (
    <main className="page-container">
      {isDelayed && (
        <div className="delay-marker">
          ⚠️ 지연(캐시됨)
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="linter-banner">
          <strong>⚠️ 데이터 포맷 경고 (Data Linter)</strong>
          <ul>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Top Header */}
      <header className="home-header" style={{ marginBottom: '24px', animation: 'fadeInUp 0.5s ease' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
          GSF-Portfolio
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px', fontWeight: 500, letterSpacing: '-0.2px' }}>
          GSF : Bridging profit and purpose
        </p>
      </header>

      {/* Hero Widget */}
      <section className="hero-balance" style={{ paddingBottom: '30px' }}>
        <h1>{formatKRW(netWorth)}</h1>
        <div className="sub-balance font-number">
          <span>자산 {formatKRW(totalAssets)}</span>
          <span style={{ color: 'var(--text-red)' }}>부채 {formatKRW(totalDebt)}</span>
        </div>
      </section>

      {/* Dashboard Summary Cards */}
      <section className="dashboard-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px', paddingBottom: '40px' }}>
         <Link href="/analytics" className="delay-1" style={{ textDecoration: 'none' }}>
           <div className="card-item" style={{ padding: '26px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏠 부동산
             </h2>
             <div className="font-number" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatKRW(getSubtotal('부동산'))}
             </div>
           </div>
         </Link>

         <Link href="/analytics" className="delay-2" style={{ textDecoration: 'none' }}>
           <div className="card-item" style={{ padding: '26px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📈 유가증권 및 현금
             </h2>
             <div className="font-number" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatKRW(getSubtotal('유가증권 및 현금'))}
             </div>
           </div>
         </Link>

         <Link href="/analytics" className="delay-3" style={{ textDecoration: 'none' }}>
           <div className="card-item" style={{ padding: '26px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💳 대출 및 부채
             </h2>
             <div className="font-number text-red" style={{ fontSize: '20px', fontWeight: 700 }}>
                {formatKRW(getSubtotal('대출 및 부채'))}
             </div>
           </div>
         </Link>
      </section>

    </main>
  );
}
