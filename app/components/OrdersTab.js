'use client'

export default function OrdersTab({ orders = [] }) {
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">Orders</div>
        <div className="page-sub">All transactions settled via USDC on Arc Testnet.</div>
      </div>
      <div className="card">
        {!orders.length ? (
          <div className="empty">
            <div className="empty-icon">◆</div>
            <div className="empty-text">No orders yet.</div>
          </div>
        ) : (
          <div className="order-list">
            {orders.map(o => (
              <div className="product-row" key={o.txHash}>
                <div className="product-info">
                  <div className="product-name">Product #{o.productId}</div>
                  <div className="product-meta">Buyer: {o.buyer}</div>
                </div>
                <div className="product-stock">Qty · {o.quantity}</div>
                <div className="product-price">{o.amount.toFixed(2)} USDC</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
