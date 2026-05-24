'use client'
import Image from 'next/image'
import { CAT_EMOJI } from '../lib/constants'

export default function ProductsTab({ dispP, delistProduct, goTab }) {
  return (
    <section className="content active">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div className="page-title">Products</div>
          <div className="page-sub">Your on-chain listings on Arcade Market.</div>
        </div>
        <button className="btn btn-primary" onClick={() => goTab('addproduct')}>+ List Product</button>
      </div>
      <div className="card" style={{ position: 'relative' }}>
        {dispP.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◉</div>
            <div className="empty-text">No products listed yet.</div>
            <button className="empty-cta" onClick={() => goTab('addproduct')}>✦ List your first product</button>
          </div>
        ) : (
          dispP.map(p => {
            const em = CAT_EMOJI[p.category] || '📦'
            const low = p.stock <= 3
            return (
              <div key={p.id} className="product-row">
                <div className="product-thumb">
                  {p.imageUri && p.imageUri.startsWith('data:')
                    ? <Image src={p.imageUri} alt={p.name} width={48} height={48} unoptimized />
                    : em}
                </div>
                <div className="product-info">
                  <div className="product-name">
                    {p.name}
                    {p.source === 'chain'
                      ? <span style={{ fontSize: 10, color: 'var(--navy3)', fontFamily: "'DM Mono',monospace", marginLeft: 6, background: 'rgba(45,74,154,0.15)', padding: '1px 6px', borderRadius: 4 }}>on-chain</span>
                      : <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'DM Mono',monospace", marginLeft: 6 }}>local</span>
                    }
                  </div>
                  <div className="product-meta">{p.category} · ID: {p.id}</div>
                </div>
                <div className={`product-stock${low ? ' low' : ''}`}>{low ? 'Low Stock' : 'In Stock'} · {p.stock}</div>
                <div className="product-price">{p.priceUsdc.toFixed(2)} USDC</div>
                <button className="btn btn-outline btn-sm" onClick={() => delistProduct(p.id)}>Delist</button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
