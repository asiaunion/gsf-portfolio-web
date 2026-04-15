import Papa from 'papaparse';

export interface RowData {
  분류: string;
  통화: string;
  증권사: string;
  종목명: string;
  종목코드: string;
  수량: string;
  매입단가: string;
  평가금액: string;
}

export interface Asset {
  category: string;
  broker: string;
  name: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  loan: number;
  fixedFX: string;
  valueKRW: number;
  isDebt: boolean;
  currency: 'KRW' | 'USD' | 'JPY';
  bigCategory: '유가증권 및 현금' | '부동산' | '대출 및 부채';
}

export const ORDER = ["주택담보", "주식담보", "임대보증금", "카드(장기)", "학자금", "대출", "기타"];

const getMockData = (): string => `분류,통화,증권사,종목명,종목코드,수량,매입단가,평가금액
주식,KRW,대신증권(크레온),동서,026960.KS,1394,28414,38183031
예수금,KRW,대신증권(크레온),예수금(현금),cash,1,3033551,3033551
주식,KRW,키움증권,동서,026960.KS,1000,28919,27600000
주식,KRW,키움증권,동서,026960.KS,500,28809,13800000
주식,KRW,키움증권,동서,026960.KS,250,27100,6900000
예수금,KRW,키움증권,예수금(현금),cash,1,13700,13700
주식,KRW,한국투자증권,동서,026960.KS,12,27860,329400
주식,KRW,미래에셋증권,동서,026960.KS,40,24906,1101752
주식,KRW,미래에셋증권,동서,026960.KS,375,27490,10328646
예수금,KRW,미래에셋증권,예수금(현금),cash,1,27800,27816
주식담보대출,KRW,미래에셋증권,동서,026960.KS,,,535250
주식담보대출,KRW,키움증권,동서,026960.KS,,,20263900
주식담보대출,KRW,키움증권,동서,026960.KS,,,10094300
주식담보대출,KRW,대신증권(크레온),동서,026960.KS,,,26090000
주택담보대출,KRW,신한은행,신용빌라202호,-,0,0,26639928
주택담보대출,KRW,신한은행,태산APT 324호,-,0,0,34560000
주택담보대출,KRW,KB국민,신용빌라201호,-,0,0,8552688
기타대출,KRW,NH농협,비상금대출,-,0,0,2583335
기타대출,KRW,K뱅크,쏙대출,-,0,0,2810829
학자금대출,KRW,한국장학재단,학자금 대출,-,0,0,21260908
카드(장기)대출,KRW,신한카드,스피드론 플러스 (1),-,0,0,10535462
카드(장기)대출,KRW,신한카드,스피드론 플러스 (2),-,0,0,3607598
카드(장기)대출,KRW,신한카드,스피드론 플러스 (3),-,0,0,3431789
부동산시세,KRW,,태산(324호) 시세,-,1,,120000000
부동산시세,KRW,,신용(201호) 시세,-,1,,80000000
부동산시세,KRW,,신용(202호) 시세,-,1,,80000000
부동산 보증금,KRW,,태산(324호) 보증금,,1,0,50000000
부동산 보증금,KRW,,신용(201호) 보증금,,1,0,30000000
부동산 보증금,KRW,,신용(202호) 보증금,-,1,0,30000000
`;

async function getCurrentPrice(ticker: string, fallbackPrice: number): Promise<number> {
  if (!ticker || ticker === '-' || ticker.toLowerCase() === 'cash') return fallbackPrice;
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.chart.result[0].meta.regularMarketPrice || fallbackPrice;
    }
  } catch(e) {}
  return fallbackPrice;
}

export async function fetchAssetData(): Promise<{ assets: Asset[], isDelayed: boolean, errors: string[] }> {
  let csvText = getMockData();
  let isDelayed = false;
  const errors: string[] = [];
  
  if (process.env.GSHEETS_CSV_URL) {
    let url = process.env.GSHEETS_CSV_URL;
    if (url.includes('docs.google.com/spreadsheets') && url.includes('/edit')) {
      url = url.replace(/\/edit\??.*/, '/export?format=csv');
    }
    
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        csvText = await res.text();
      } else {
        isDelayed = true;
      }
    } catch (e) {
      isDelayed = true;
    }
  }

  const parseResult = Papa.parse<RowData>(csvText, { header: true, skipEmptyLines: true });
  
  if (parseResult.errors.length > 0) {
    parseResult.errors.forEach(e => {
        errors.push(`CSV 파싱 오류 (행 ${e.row}): ${e.message}`);
    });
  }

  const rates = {
    USD: 1350,
    JPY: 9.0, 
  };

  const assetsNested = await Promise.all(parseResult.data.map(async (row, idx) => {
    // Data Linter validation
    if (!row.분류 || row.분류.trim() === '') {
        errors.push(`구글 시트 ${idx + 2}행: '분류' 열이 비어 있어 '기타 자산'으로 강제 할당됨.`);
    }

    const category = (row.분류 || '기타 자산').trim();
    const currencyRaw = (row.통화 || 'KRW').trim().toUpperCase();
    const broker = (row.증권사 || '-').trim();
    const name = (row.종목명 || '알 수 없음').trim();
    const ticker = (row.종목코드 || '').trim();
    const quantity = parseFloat((row.수량 || '1').replace(/,/g, ''));
    const buyPrice = parseFloat((row.매입단가 || '0').replace(/,/g, ''));
    const evalPrice = parseFloat((row.평가금액 || '0').replace(/,/g, ''));

    if (isNaN(quantity)) errors.push(`구글 시트 ${idx + 2}행: '수량' 값을 숫자로 변환할 수 없음 (${row.수량}).`);
    if (isNaN(buyPrice)) errors.push(`구글 시트 ${idx + 2}행: '매입단가' 값을 숫자로 변환할 수 없음 (${row.매입단가}).`);

    const finalQuantity = isNaN(quantity) ? 0 : quantity;
    const finalBuyPrice = isNaN(buyPrice) ? 0 : buyPrice;
    const finalEvalPrice = isNaN(evalPrice) ? 0 : evalPrice;

    let currency: 'KRW' | 'USD' | 'JPY' = 'KRW';
    if (currencyRaw === 'USD' || name.includes('(USD)') || ticker === 'USD') currency = 'USD';
    if (currencyRaw === 'JPY' || name.includes('(JPY)') || ticker === 'JPY') currency = 'JPY';
    
    let fxRate = 1;
    if (currency === 'USD') fxRate = rates.USD;
    if (currency === 'JPY') fxRate = rates.JPY;
    
    const isExplicitDebtRow = ORDER.includes(category) || category.includes('대출') || category.includes('보증금');
    
    let valueKRW = 0;
    let loan = 0;
    
    if (isExplicitDebtRow) {
        loan = finalEvalPrice > 0 ? finalEvalPrice : (finalBuyPrice > 0 ? finalBuyPrice : 0);
        valueKRW = loan; // Set debt value to valueKRW
    } else {
        let curPrice = finalBuyPrice;
        if (finalEvalPrice > 0) {
            // User explicitly provided evaluation value in the sheet! Use it directly.
            valueKRW = finalEvalPrice * fxRate; 
        } else if (ticker && ticker !== '-' && ticker.toLowerCase() !== 'cash') {
            // Live fetch from Yahoo
            curPrice = await getCurrentPrice(ticker, finalBuyPrice);
            valueKRW = finalQuantity * curPrice * fxRate;
        } else {
            valueKRW = finalQuantity * curPrice * fxRate;
        }
    }

    const results: Asset[] = [];

    if (isExplicitDebtRow) {
      // Map new column categories to old unified bigCategory/category style smoothly
      let mappedCat = category;
      if (category.includes('보증금')) mappedCat = '임대보증금'; // Force mapping to Jeonse

      results.push({
        category: mappedCat, broker, name, ticker, quantity: finalQuantity, buyPrice: finalBuyPrice, loan, fixedFX: '', 
        valueKRW, isDebt: true, currency, bigCategory: '대출 및 부채'
      });
    } else {
      let bigCategory: '유가증권 및 현금' | '부동산' | '대출 및 부채' = '유가증권 및 현금';
      if (category.includes('부동산')) {
        bigCategory = '부동산';
      }

      results.push({
        category, broker, name, ticker, quantity: finalQuantity, buyPrice: finalBuyPrice, loan: 0, fixedFX: '', 
        valueKRW, isDebt: false, currency, bigCategory
      });
    }

    return results;
  }));

  const assets = assetsNested.flat();

  return { assets, isDelayed, errors };
}
