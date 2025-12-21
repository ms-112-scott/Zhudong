import React from 'react'

// 輔助小元件：數據卡片
export const StatsCard = ({ icon, number, label, sub }) => (
  <div className="p-6 bg-surface-100 rounded-xl border border-surface-200 hover:border-main transition-colors group">
    <div className="text-main mb-3 group-hover:scale-110 transition-transform duration-300">
      {React.cloneElement(icon, { size: 32 })} 
    </div>
    <div className="text-3xl font-bold text-fg mb-1">{number}</div>
    <div className="text-sm font-medium text-muted">{label}</div>
 
    <div className="text-xs text-dim mt-1">{sub}</div>
  </div>
)
