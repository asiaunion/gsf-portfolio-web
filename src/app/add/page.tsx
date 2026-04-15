'use client'

import { useActionState } from 'react'
import { addTransaction } from './actions'
import styles from './add.module.css'

const initialState = { message: '', error: '' }

export default function AddPage() {
  const [state, formAction, isPending] = useActionState(addTransaction, initialState)

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>기록 추가</h1>
      
      <div className={styles.card}>
        <form action={formAction} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>종류</label>
            <select name="category" className={styles.input} required defaultValue="주식">
              <optgroup label="유가증권">
                <option value="주식">주식</option>
                <option value="예수금">예수금</option>
                <option value="채권">채권</option>
              </optgroup>
              <optgroup label="대출 및 보증금">
                <option value="주택담보대출">주택담보대출</option>
                <option value="주식담보대출">주식담보대출</option>
                <option value="임대보증금">임대보증금</option>
                <option value="기타대출">기타대출</option>
              </optgroup>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>통화</label>
            <select name="currency" className={styles.input} required defaultValue="KRW">
              <option value="KRW">KRW (원화)</option>
              <option value="USD">USD (달러)</option>
              <option value="JPY">JPY (엔화)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>플랫폼 (증권사/은행)</label>
            <input type="text" name="broker" className={styles.input} placeholder="예: 키움증권, 신한은행" required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>종목명 (이름)</label>
            <input type="text" name="name" className={styles.input} placeholder="예: 삼성전자, 테슬라" required />
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>수량</label>
            <input type="number" name="quantity" className={styles.input} step="any" placeholder="0" required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>단가 (통화 기준 금액)</label>
            <input type="number" name="price" className={styles.input} step="any" placeholder="0" required />
          </div>

          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.message && <p className={styles.success}>{state.message}</p>}

          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? '처리 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
