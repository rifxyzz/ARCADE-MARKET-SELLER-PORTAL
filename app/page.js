'use client'

import { useDashboard } from './lib/useDashboard'
import GateScreen    from './components/GateScreen'
import Sidebar       from './components/Sidebar'
import Topbar        from './components/Topbar'
import DashboardTab  from './components/DashboardTab'
import AnalyticsTab  from './components/AnalyticsTab'
import ProductsTab   from './components/ProductsTab'
import OrdersTab     from './components/OrdersTab'
import AddProductTab from './components/AddProductTab'
import SettingsTab   from './components/SettingsTab'

export default function Page() {
  const d = useDashboard()

  return (
    <>
      {/* Star particles */}
      <div id="stars" />
      <div id="stars2" />
      <div id="stars3" />

      <GateScreen
        gateOpen={d.gateOpen}
        gLoad={d.gLoad}
        gSt={d.gSt}
        connect={d.connect}
      />

      <Sidebar
        tab={d.tab}
        goTab={d.goTab}
        dispP={d.dispP}
        tier={d.tier}
        nftBalance={d.ws.nftBalance}
      />

      <Topbar
        tab={d.tab}
        address={d.ws.address}
        isArc={d.isArc}
        avRef={d.avRef}
        disconnect={d.disconnect}
        connect={d.connect}
      />

      <main className="main">
        {d.tab === 'dashboard' && (
          <DashboardTab
            stats={d.stats}
            ws={d.ws}
            cInput={d.cInput}
            setCInput={d.setCInput}
            saveContract={d.saveContract}
            goTab={d.goTab}
          />
        )}
        {d.tab === 'analytics' && (
          <AnalyticsTab
            stats={d.stats}
            dispP={d.dispP}
            avgOrd={d.avgOrd}
            tier={d.tier}
          />
        )}
        {d.tab === 'products' && (
          <ProductsTab
            dispP={d.dispP}
            delistProduct={d.delistProduct}
            goTab={d.goTab}
          />
        )}
        {d.tab === 'orders' && <OrdersTab />}
        {d.tab === 'addproduct' && (
          <AddProductTab
            pf={d.pf}
            setPf={d.setPf}
            listLoad={d.listLoad}
            listTx={d.listTx}
            listProduct={d.listProduct}
            saveDraft={d.saveDraft}
            onImg={d.onImg}
            ws={d.ws}
          />
        )}
        {d.tab === 'settings' && (
          <SettingsTab
            ws={d.ws}
            sf={d.sf}
            setSf={d.setSf}
            cInput={d.cInput}
            setCInput={d.setCInput}
            saveContract={d.saveContract}
            saveStore={d.saveStore}
            disconnect={d.disconnect}
            tier={d.tier}
          />
        )}
      </main>

      {/* Toast */}
      <div className={`toast${d.toast.show ? ' show' : ''} ${d.toast.type}`}>
        <span className="toast-icon">
          {d.toast.type === 'success' ? '✓' : d.toast.type === 'error' ? '⚠' : '◈'}
        </span>
        <span>{d.toast.msg}</span>
      </div>

      {/* TX Modal */}
      <div className={`modal-overlay${d.txMod.show ? ' show' : ''}`}>
        <div className="modal">
          <div className="modal-icon">{d.txMod.icon}</div>
          <div className="modal-title">{d.txMod.title}</div>
          <div className="modal-desc">{d.txMod.desc}</div>
          {d.txMod.hash && (
            <div className="modal-hash">
              TX:{' '}
              <a
                href={`https://testnet.arcscan.app/tx/${d.txMod.hash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--copper3)' }}
              >
                {d.txMod.hash} ↗
              </a>
            </div>
          )}
          <button className="modal-close" onClick={() => d.setTxMod(m => ({ ...m, show: false }))}>
            CLOSE
          </button>
        </div>
      </div>
    </>
  )
}
