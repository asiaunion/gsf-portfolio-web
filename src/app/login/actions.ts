'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const pin = formData.get('pin')
  
  if (pin === process.env.APP_PIN) {
    const cookieStore = await cookies()
    cookieStore.set('auth_session', 'authenticated', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
  } else {
    return { error: '잘못된 PIN 번호입니다.' }
  }
  
  // redirect MUST be outside the try/catch or conditional block if it handles redirect
  redirect('/')
}
