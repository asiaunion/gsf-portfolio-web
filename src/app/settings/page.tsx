export default function SettingsPage() {
  const hasGSheetsEnv = !!process.env.GSHEETS_CSV_URL;

  return (
    <main className="page-container">
      <section className="hero-balance">
        <h1>설정</h1>
        <div className="sub-balance">
          <span>앱 설정 및 정보</span>
        </div>
      </section>

      <section>
        <h2 className="section-title">데이터 소스</h2>
        <div className="card-group">
          <div className="card-item">
            <div className="item-left">
              <div className="item-title">Google Sheets 연동</div>
              <div className="item-broker">환경 변수(ENV) 기반</div>
            </div>
            <div className="item-right">
              {hasGSheetsEnv ? (
                <span className="badge badge-usd" style={{ backgroundColor: 'rgba(59,246,168,0.1)', color: '#16a34a' }}>연결됨</span>
              ) : (
                <span className="badge" style={{ backgroundColor: 'rgba(240,68,82,0.1)', color: 'var(--text-red)' }}>기본 Demo</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">앱 정보</h2>
        <div className="card-group">
          <div className="card-item">
            <div className="item-left">
              <div className="item-title">버전</div>
            </div>
            <div className="item-right">
              <div className="item-value font-number" style={{ fontSize: '15px' }}>v6.0.0 (Next.js)</div>
            </div>
          </div>
          <div className="card-item">
            <div className="item-left">
              <div className="item-title">UI 테마</div>
            </div>
            <div className="item-right">
              <div className="item-value" style={{ fontSize: '15px' }}>시스템 (다크/라이트)</div>
            </div>
          </div>
          <div className="card-item">
            <div className="item-left">
              <div className="item-title">개발 모드</div>
            </div>
            <div className="item-right">
              <div className="item-value" style={{ fontSize: '15px' }}>Sandbox E2E</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
