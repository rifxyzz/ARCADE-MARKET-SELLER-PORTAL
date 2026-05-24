'use client'

export default function AnalyticsTab({ stats, dispP, avgOrd, tier }) {
  const total = dispP.reduce((s, p) => s + p.priceUsdc * p.totalSold, 0)
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">Performance metrics for your store on Arc Testnet.</div>
      </div>
      <div className="analytics-grid">
        <div className="stat-card navy">
          <div className="stat-label">Avg. Order Value</div>
          <div className="stat-value">{avgOrd} <span>USDC</span></div>
          <div className="stat-delta">on-chain data</div>
        </div>
        <div className="stat-card copper">
          <div className="stat-label">Active Products</div>
          <div className="stat-value">{stats.listings}</div>
          <div className="stat-delta">live listings</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Seller Tier</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{tier.name}</div>
          <div className="stat-delta">access level</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Sales by Product</div>
        </div>
        {dispP.length === 0 ? (
          <div className="empty"><div className="empty-icon">◈</div><div className="empty-text">No sales data yet.</div></div>
        ) : (
          <table>
            <thead>
              <tr><th>Product</th><th>Units Sold</th><th>Revenue (USDC)</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {dispP.map(p => {
                const r = p.priceUsdc * p.totalSold
                const pct = total > 0 ? ((r / total) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={p.id}>
                    <td className="order-item">{p.name}</td>
                    <td>{p.totalSold}</td>
                    <td className="order-price">{r.toFixed(2)}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: 'var(--navy3)' }}>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
