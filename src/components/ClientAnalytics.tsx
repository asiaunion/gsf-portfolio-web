"use client";

import { useState } from 'react';
import type { Asset } from '@/lib/data';

interface ClientAnalyticsProps {
  assets: Asset[];
}

export default function ClientAnalytics({ assets }: ClientAnalyticsProps) {
  const getCategoryIcon = (category: string) => {
    if (category.includes('부동산') || category.includes('보증금')) return '🏠';
    if (category.includes('주식') || category.includes('증권')) return '📈';
    if (category.includes('예수금') || category.includes('현금')) return '💵';
    if (category.includes('대출') || category.includes('론')) return '💳';
    return '💎';
  };

  // 1. 차트 렌더링 데이터 준비 (순자산 대상: 부동산 + 유가증권/현금)
  const chartAssets = assets.filter(a => a.bigCategory !== '대출 및 부채');
  
  let chartTotal = 0;
  const chartDist: Record<string, number> = {};
  
  chartAssets.forEach(a => {
    chartTotal += a.valueKRW;
    const key = a.bigCategory;
    if (!chartDist[key]) chartDist[key] = 0;
    chartDist[key] += a.valueKRW;
  });

  const chartData = Object.entries(chartDist)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      percentage: chartTotal > 0 ? (value / chartTotal) * 100 : 0
    }));

  const pieColors: Record<string, string> = {
    '유가증권 및 현금': '#3182f6', // Toss Blue
    '부동산': '#3bf6a8', // Mint
    '대출 및 부채': '#f04452', // Red
  };

  let conicString = '';
  let startDeg = 0;
  chartData.forEach(item => {
    const endDeg = startDeg + (item.percentage * 3.6);
    const color = pieColors[item.name] || '#8b95a1';
    conicString += `${color} ${startDeg}deg ${endDeg}deg, `;
    startDeg = endDeg;
  });
  conicString = conicString.slice(0, -2); // remove last comma

  // 2. 전체 대분류 리스트 준비 (아코디언 용)
  const allDist: Record<string, Asset[]> = {
    '부동산': [],
    '유가증권 및 현금': [],
    '대출 및 부채': []
  };

  assets.forEach(a => {
    if (allDist[a.bigCategory]) {
      allDist[a.bigCategory].push(a);
    }
  });

  // 상태 관리 (아코디언 토글)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    '부동산': false,
    '유가증권 및 현금': false,
    '대출 및 부채': false
  });

  const toggleExpand = (category: string) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const formatKRW = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num)) + '원';
  };

  return (
    <>
      <section className="hero-balance">
        <h1>분석</h1>
         <div className="sub-balance mb-4">
          <span>포트폴리오 비중</span>
        </div>
      </section>

      {chartTotal > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <div 
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(${conicString})`,
              boxShadow: 'var(--card-shadow)'
            }}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '60px 0', color: 'var(--text-sub)' }}>
          분석할 자산이 없습니다.
        </div>
      )}

      <section>
        <h2 className="section-title">비중 상세 (클릭하여 펼치기)</h2>
        <div className="card-group" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {Object.entries(allDist).map(([groupName, groupAssets]) => {
            const groupTotal = groupAssets.reduce((sum, a) => sum + (a.isDebt ? (a.loan > 0 ? a.loan : a.valueKRW) : a.valueKRW), 0);
            const isExpanded = expanded[groupName];
            const isDebtGroup = groupName === '대출 및 부채';
            
            // 비율 계산 (대출은 차트에 안 들어가지만 표시용으로 별도 비율 계산 안함, 혹은 총자산 대비 표시)
            const percentageText = !isDebtGroup && chartTotal > 0 
                ? ((groupTotal / chartTotal) * 100).toFixed(1) + '%' 
                : '';

            return (
              <div key={groupName} style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  className="card-item" 
                  onClick={() => toggleExpand(groupName)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="item-left">
                    <div className="item-title">
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: pieColors[groupName] 
                      }}></span>
                      {groupName} {groupAssets.length > 0 && <span style={{ fontSize: '12px', color: 'var(--text-sub)'}}>{groupAssets.length}</span>}
                    </div>
                  </div>
                  <div className="item-right" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`item-value font-number ${isDebtGroup ? 'text-red' : ''}`}>
                        {formatKRW(groupTotal)}
                      </div>
                      <div className="item-qty font-number">{percentageText}</div>
                    </div>
                    {/* Chevron Icon */}
                    <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="6 9 12 15 18 9"></polyline>
                       </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && groupAssets.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(240, 244, 248, 0.5)', padding: '8px 20px', borderBottom: '1px solid rgba(128, 128, 128, 0.05)' }}>
                    {groupAssets.map((asset, idx) => {
                      const itemVal = asset.isDebt ? (asset.loan > 0 ? asset.loan : asset.valueKRW) : asset.valueKRW;
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: idx < groupAssets.length -1 ? '1px solid rgba(128,128,128,0.08)' : 'none' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                             <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                               {getCategoryIcon(asset.category)}
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{asset.name}</span>
                               <span style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '2px' }}>{asset.broker !== '-' ? asset.broker : asset.category}</span>
                             </div>
                           </div>
                           <div className={`font-number ${isDebtGroup ? 'text-red' : ''}`} style={{ fontSize: '16px', fontWeight: 600, alignSelf: 'center' }}>
                              {formatKRW(itemVal)}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </section>
    </>
  );
}
