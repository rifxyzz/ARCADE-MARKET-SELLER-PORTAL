'use client'
import { CHART_H, DAYS } from '../lib/constants'

export default function DashboardTab({ stats, ws, cInput, setCInput, saveContract, goTab }) {
  const maxBar = Math.max(...CHART_H)
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-sub">Your store performance on Arc Testnet · USDC settlements</div>
      </div>

      {ws.address && !ws.contractAddr && (
        <div className="contract-setup">
          <div className="contract-setup-title">⬡ Connect Your ArcadeMarket Contract</div>
          <div className="contract-setup-desc">
            Deploy{' '}
            <code style={{ color: 'var(--copper3)', fontFamily: "'DM Mono',monospace" }}>ArcadeMarket.sol</code>
            {' '}on Arc Testnet, then paste your contract address below to enable on-chain listing.
          </div>
          <div className="contract-input-row">
            <input
              className="form-input"
              type="text"
              placeholder="0x... your deployed ArcadeMarket contract address"
              value={cInput}
              onChange={e => setCInput(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={saveContract}>Save</button>
          </div>
        </div>
      )}

      <div className="info-banner">
        <div className="info-banner-icon">🃏</div>
        <div className="info-banner-text">
          <div className="info-banner-title">Early Genesis Seller</div>
          <div className="info-banner-desc">Only 1,000 Genesis NFTs available. Your ARCM NFT unlocks seller privileges — list products directly on Arcade Market.</div>
        </div>
        <a href="https://www.arcademarkets.xyz/mint" target="_blank" rel="noreferrer" className="banner-btn copper-btn">Mint ARCM ↗</a>
      </div>

      <div className="stats-grid">
        <div className="stat-card navy">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{stats.revenue.toFixed(2)} <span>USDC</span></div>
          <div className="stat-delta">Arc Testnet</div>
        </div>
        <div className="stat-card copper">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-delta">on-chain</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🏪</div>
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{stats.listings}</div>
          <div className="stat-delta up">live on market</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🃏</div>
          <div className="stat-label">Genesis NFT</div>
          <div className="stat-value">{ws.nftBalance}</div>
          <div className="stat-delta">ARCM held</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue — Last 7 Days</div>
          </div>
          <div className="chart-wrap">
            <div className="chart-total">
              {stats.revenue.toFixed(2)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 400 }}>USDC</span>
            </div>
            <div className="chart-sub" style={{ marginBottom: 16 }}>Cumulative this week</div>
            <div className="chart-bars">
              {CHART_H.map((h, i) => (
                <div key={i} className="bar-col">
                  <div className={`bar${h === maxBar ? ' peak' : ''}`} style={{ height: Math.round(h / maxBar * 88) + 'px' }} />
                  <div className="bar-label">{DAYS[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>Settled in USDC · Arc Testnet</span>
              <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--copper3)', textDecoration: 'none', fontFamily: "'DM Mono',monospace" }}>View on Explorer ↗</a>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
            <button className="card-action" onClick={() => goTab('orders')}>View all</button>
          </div>
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">No orders yet. List a product to get started.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
