'use client'
import Image from 'next/image'

export default function AddProductTab({ pf, setPf, listLoad, listTx, listProduct, saveDraft, onImg, ws }) {
  const tierName = ws.nftBalance >= 10000 ? 'LEGENDARY' : ws.nftBalance >= 1000 ? 'EPIC' : ws.nftBalance >= 100 ? 'RARE' : 'COMMON'
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">List Product</div>
        <div className="page-sub">List a new item on Arcade Market — stored on-chain on Arc Testnet.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Left column */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Product Details</div></div>
            <div style={{ padding: 20 }}>
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Neon Sword, Cyber Cape, Arcade Pass…"
                    value={pf.name} onChange={e => setPf(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" placeholder="Describe your product…"
                    value={pf.desc} onChange={e => setPf(f => ({ ...f, desc: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USDC) *</label>
                  <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0.00"
                    value={pf.price} onChange={e => setPf(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input className="form-input" type="number" min="1" placeholder="1"
                    value={pf.stock} onChange={e => setPf(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={pf.cat} onChange={e => setPf(f => ({ ...f, cat: e.target.value }))}>
                    {['Collectibles', 'Game Items', 'Apparel', 'Access Pass', 'Digital Art'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Product Image</div></div>
            <div style={{ padding: 20 }}>
              <div className="upload-zone">
                <input type="file" accept="image/*" onChange={onImg} />
                <div className="upload-icon">🖼</div>
                <div className="upload-text">Drag &amp; drop or click to upload</div>
                <div className="upload-sub">PNG · JPG · GIF · Max 5MB</div>
                {pf.imgPrev && (
                  <Image
                    src={pf.imgPrev}
                    alt="preview"
                    width={480}
                    height={120}
                    unoptimized
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, marginTop: 12 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Seller Verification</div></div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(48,224,0,0.05)', border: '1px solid rgba(48,224,0,0.15)', borderRadius: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>Genesis Verified</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: "'DM Mono',monospace" }}>{ws.nftBalance} ARCM · {tierName}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Your Genesis NFT grants seller access. Listings go live on Arcade Market instantly.</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Payment Wallet</div></div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>USDC revenue sent to:</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--copper3)', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', wordBreak: 'break-all' }}>
                {ws.address || 'Not connected'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>⚡ Instant USDC settlement · Arc Testnet</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Contract</div></div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>ArcadeMarket contract:</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'var(--navy3)', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', wordBreak: 'break-all' }}>
                {ws.contractAddr || 'Not configured'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', borderRadius: 50, padding: '13px 20px' }}
              disabled={listLoad}
              onClick={listProduct}
            >
              {listLoad ? <><span className="spinner" /> Submitting...</> : 'List on Arcade Market'}
            </button>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: 'var(--text3)', textAlign: 'center', minHeight: 16 }}>{listTx}</div>
            <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={saveDraft}>Save Draft</button>
          </div>
        </div>
      </div>
    </section>
  )
}
