'use client'

export default function OrdersTab() {
  return (
    <section className="content active">
      <div className="page-header">
        <div className="page-title">Orders</div>
        <div className="page-sub">All transactions settled via USDC on Arc Testnet.</div>
      </div>
      <div className="card">
        <div className="empty">
          <div className="empty-icon">◆</div>
          <div className="empty-text">No orders yet.</div>
        </div>
      </div>
    </section>
  )
}
