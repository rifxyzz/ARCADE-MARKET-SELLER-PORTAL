'use client'
import { short } from '../lib/constants'

const TITLES = {
  dashboard: 'Dashboard', analytics: 'Analytics', products: 'Products',
  orders: 'Orders', addproduct: 'List Product', settings: 'Settings'
}

export default function Topbar({ tab, address, isArc, avRef, disconnect, connect }) {
  return (
    <header className="topbar">
      <div className="topbar-title">{TITLES[tab] || tab}</div>
      <div className="network-pill">
        <div className={`net-dot${isArc ? '' : ' wrong'}`} />
        <span>{address ? (isArc ? 'Arc Testnet' : 'Wrong Network') : 'Detecting...'}</span>
      </div>
      <button
        className={`wallet-btn${address ? ' disconnect' : ''}`}
        onClick={address ? disconnect : () => connect(false)}
      >
        <canvas ref={avRef} className="wallet-avatar" width="22" height="22" />
        <span>{address ? short(address) : 'Not Connected'}</span>
      </button>
    </header>
  )
}
