'use client'

const TIERS = [
  { id: 'common',    emoji: '⬜', name: 'COMMON',    perk: <>List up to <strong>5</strong> items</> },
  { id: 'rare',      emoji: '🟦', name: 'RARE',      perk: <>List up to <strong>20</strong> items</> },
  { id: 'epic',      emoji: '🟣', name: 'EPIC',      perk: <>List up to <strong>50</strong> items</> },
  { id: 'legendary', emoji: '🟡', name: 'LEGENDARY', perk: <><strong>Unlimited</strong> listings</> },
]

export default function SettingsTab({ ws, sf, setSf, cInput, setCInput, saveContract, saveStore, disconnect, tier }) {
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your store, wallet, and contract configuration.</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="settings-section">
          <div className="settings-title">Store Info</div>
          <div className="settings-desc">Your public storefront details on Arcade Market.</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-input" value={sf.name} onChange={e => setSf(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Handle</label>
              <input className="form-input" value={sf.handle} onChange={e => setSf(f => ({ ...f, handle: e.target.value }))} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" style={{ minHeight: 60 }} value={sf.bio} onChange={e => setSf(f => ({ ...f, bio: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={saveStore}>Save Changes</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">Connected Wallet</div>
          <div className="settings-desc">Your wallet receives all USDC payments directly on Arc Testnet.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: 'var(--copper3)', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', flex: 1, wordBreak: 'break-all' }}>
              {ws.address || 'Not connected'}
            </div>
            <button className="btn btn-outline btn-sm" onClick={disconnect}>Disconnect</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>
            Genesis NFT Balance:{' '}
            <span style={{ color: 'var(--copper3)', fontFamily: "'DM Mono',monospace" }}>{ws.nftBalance}</span> ARCM
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">ArcadeMarket Contract</div>
          <div className="settings-desc">
            Deploy{' '}
            <code style={{ color: 'var(--copper3)', fontFamily: "'DM Mono',monospace", fontSize: 11 }}>ArcadeMarket.sol</code>
            {' '}on Arc Testnet, then paste the address here. Your products will appear on{' '}
            <a href="https://www.arcademarkets.xyz/" target="_blank" rel="noreferrer" style={{ color: 'var(--copper3)' }}>arcademarkets.xyz</a>.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <input
              className="form-input"
              type="text"
              placeholder="0x... deployed ArcadeMarket contract on Arc Testnet"
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}
              value={cInput}
              onChange={e => setCInput(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={saveContract}>Save</button>
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--navy3)', wordBreak: 'break-all' }}>
            {ws.contractAddr || 'No contract configured'}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">Genesis NFT Tier</div>
          <div className="settings-desc">Your tier determines seller benefits on Arcade Market.</div>
          <div className="tier-grid">
            {TIERS.map(t => (
              <div key={t.id} className={`tier-card${tier.id === t.id ? ' active-tier' : ''}`}>
                {tier.id === t.id && <div className="tier-active-label">YOURS</div>}
                <div className="tier-emoji">{t.emoji}</div>
                <div className="tier-name">{t.name}</div>
                <div className="tier-perk">{t.perk}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href="https://www.arcademarkets.xyz/" target="_blank" rel="noreferrer" className="btn btn-outline">⬡ Go to Marketplace</a>
        <a href="https://www.arcademarkets.xyz/mint" target="_blank" rel="noreferrer" className="btn btn-outline">🃏 Mint Genesis</a>
        <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="btn btn-outline">↗ Arc Explorer</a>
      </div>
    </section>
  )
}
