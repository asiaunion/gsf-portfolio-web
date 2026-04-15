import { NextResponse } from 'next/server';
import { fetchAssetData } from '@/lib/data';
import { db, initDb } from '@/lib/db';

export async function GET(request: Request) {
  // 1. Authorization
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch current assets
    const { assets, errors } = await fetchAssetData();
    
    let totalAssets = 0;
    let totalDebt = 0;
    
    assets.forEach(asset => {
      if (asset.isDebt) {
        totalDebt += asset.valueKRW;
      } else {
        totalAssets += asset.valueKRW;
      }
    });
    
    const netWorth = totalAssets - totalDebt;

    // 3. Save to Turso DB
    await initDb();
    await db.execute({
      sql: `INSERT INTO portfolio_snapshots (total_assets, total_debt, net_worth, raw_data_json) VALUES (?, ?, ?, ?)`,
      args: [totalAssets, totalDebt, netWorth, JSON.stringify(assets)]
    });

    // 4. Send Telegram Notification
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (chatId && botToken) {
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const message = `📊 [GSF 자산 스냅샷]\n\n💰 순자산: ${Math.round(netWorth).toLocaleString()}원\n🔺 총자산: ${Math.round(totalAssets).toLocaleString()}원\n🔻 총부채: ${Math.round(totalDebt).toLocaleString()}원\n\n(참고: 데이터 로드 에러 ${errors.length}건)`;
      
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
    }

    return NextResponse.json({ success: true, netWorth, totalAssets, totalDebt });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
