'use client'

import { useActionState } from 'react'
import { login } from './actions'
import styles from './login.module.css'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>GSF Portfolio</h1>
        <p className={styles.subtitle}>접근을 위해 PIN을 입력해주세요</p>
        
        <form action={formAction} className={styles.form}>
          <input 
            type="password" 
            name="pin" 
            inputMode="numeric" 
            pattern="[0-9]*"
            className={styles.input}
            placeholder="PIN 번호 4자리"
            maxLength={4}
            autoFocus
            required
          />
          {state?.error && <p className={styles.error}>{state.error}</p>}
          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? '확인 중...' : '잠금 해제'}
          </button>
        </form>
      </div>
    </div>
  )
}
