'use client'

export default function Sidebar({ tab, goTab, dispP, tier, nftBalance }) {
  return (
    <aside className="sidebar">
      <a href="https://arcade-markets.vercel.app" target="_blank" rel="noreferrer" className="sidebar-logo">
        <div className="logo-icon">AM</div>
        <div><div className="logo-name">ARCADE</div><div className="logo-sub">Seller Portal</div></div>
      </a>
      <nav className="nav">
        <div className="nav-section">Overview</div>
        <button className={`nav-item${tab==='dashboard'?' active':''}`} onClick={() => goTab('dashboard')}><span className="nav-icon">◈</span>Dashboard</button>
        <button className={`nav-item${tab==='analytics'?' active':''}`} onClick={() => goTab('analytics')}><span className="nav-icon">◉</span>Analytics</button>
        <div className="nav-section">Store</div>
        <button className={`nav-item${tab==='products'?' active':''}`} onClick={() => goTab('products')}>
          <span className="nav-icon">◆</span>Products
          <span className="nav-badge">{dispP.filter(p => p.active).length}</span>
        </button>
        <button className={`nav-item${tab==='orders'?' active':''}`} onClick={() => goTab('orders')}>
          <span className="nav-icon">⬡</span>Orders<span className="nav-badge red">0</span>
        </button>
        <button className={`nav-item${tab==='addproduct'?' active':''}`} onClick={() => goTab('addproduct')}><span className="nav-icon">✦</span>List Product</button>
        <div className="nav-section">Account</div>
        <button className={`nav-item${tab==='settings'?' active':''}`} onClick={() => goTab('settings')}><span className="nav-icon">◎</span>Settings</button>
        <a href="https://arcade-markets.vercel.app/market" target="_blank" rel="noreferrer" className="nav-item"><span className="nav-icon">⬖</span>Browse Market</a>
        <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="nav-item"><span className="nav-icon">↗</span>Arc Explorer</a>
      </nav>
      <div className="nft-status">
        <div className="nft-badge-row"><div className="pulse-dot" /><div className="nft-label">GENESIS HOLDER</div></div>
        <div className="nft-card-name">{nftBalance} ARCM held</div>
        <div className="nft-card-tier">{tier.name} TIER</div>
      </div>
    </aside>
  )
}
