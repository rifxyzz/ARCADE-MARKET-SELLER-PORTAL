'use client'
export default function GateScreen({ gateOpen, gLoad, gSt, connect }) {
  return (
    <div id="gate-screen" className={gateOpen ? '' : 'hidden'}>
      <div className="gate-glow" />
      <div className="gate-card">
        <div className="gate-logo-wrap">
          <div className="gate-logo-icon">AM</div>
          <div className="gate-logo-text">
            <div className="gate-logo-name">ARCADE MARKET</div>
            <div className="gate-logo-sub">Arc Testnet · Circle</div>
          </div>
        </div>
        <div className="gate-title">Seller Portal<br /><span>Exclusive Access</span></div>
        <div className="gate-sub">Connect your wallet to verify Genesis NFT ownership and access your seller dashboard on Arc Testnet.</div>
        <div className="gate-requirement">
          <div className="gate-req-icon">🃏</div>
          <div>
            <div className="gate-req-title">Genesis NFT Required</div>
            <div className="gate-req-desc">Hold ≥ 1 ARCM Genesis NFT to unlock seller access · USDC payments on Arc Testnet</div>
          </div>
        </div>
        <button className="gate-connect-btn" disabled={gLoad} onClick={() => connect(false)}>
          {gLoad ? <><span className="spinner" /> Connecting...</> : 'Connect Wallet'}
        </button>
        <div className={`gate-status ${gSt.type}`}>{gSt.msg}</div>
        <div className="gate-footer">
          Don&apos;t have a Genesis NFT?{' '}
          <a href="https://arcade-markets.vercel.app/mint" target="_blank" rel="noreferrer">Mint ARCM Early Genesis ↗</a><br />
          <a href="https://arcade-markets.vercel.app" target="_blank" rel="noreferrer">arcade-markets.vercel.app ↗</a>
          &nbsp;·&nbsp;
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">Get test USDC ↗</a>
        </div>
      </div>
    </div>
  )
}
