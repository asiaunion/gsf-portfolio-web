'use server'

import { google } from 'googleapis';
import { db, initDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addTransaction(prevState: any, formData: FormData) {
  try {
    const category = formData.get('category') as string;
    const currency = formData.get('currency') as string;
    const broker = formData.get('broker') as string;
    const name = formData.get('name') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const price = parseFloat(formData.get('price') as string);
    const ticker = '-'; // 종목코드는 현재 편의상 생략으로 고정

    // 1. Turso DB 저장 (Transaction Log)
    await initDb();
    await db.execute({
      sql: `INSERT INTO portfolio_transactions (category, currency, broker, name, ticker, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [category, currency, broker, name, ticker, quantity, price]
    });

    // 2. Google Sheets API 연동 (양방향 동기화)
    const clientEmail = process.env.GCP_CLIENT_EMAIL;
    const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GSHEETS_ID;

    if (clientEmail && privateKey && sheetId) {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const values = [
        [category, currency, broker, name, ticker, quantity.toString(), price.toString(), '']
      ]; // 평가금액(8번째 열)은 공백으로 둔다. 앱에서 자동 파싱 처리.

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:H', // 시트의 A열부터 H열까지 추정
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
      });
    } else {
      console.warn('GCP 환경 변수가 누락되어 구글 시트 동기화는 건너뜁니다.');
    }

    revalidatePath('/'); // 홈 화면 ISR 캐시 초기화
    return { message: '성공적으로 기록되었습니다.', error: '' };
  } catch (error: any) {
    console.error('Error adding transaction:', error);
    return { message: '', error: error.message || '저장 중 오류가 발생했습니다.' };
  }
}
