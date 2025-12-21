import React from 'react'
import { Link } from 'react-router-dom' // 1. 引入 Link

// 2. 接收 'to' 屬性 (預設為 '#' 防止報錯)
export const FeatureCard = ({ title, desc, tag, to = '#' }) => {
  return (
    // 3. 使用 Link 包住整個卡片
    // 添加 block, h-full 確保版面撐滿
    // 添加 hover:-translate-y-1 讓卡片滑鼠移上去會浮起來
    <Link 
      to={to} 
      className="block h-full group transition-all duration-300 hover:-translate-y-2"
    >
      <div className="
        h-full flex flex-col justify-between
        bg-surface-50 p-8 rounded-2xl 
        border border-surface-200 
        transition-colors duration-300
        group-hover:border-main/50 group-hover:shadow-lg group-hover:shadow-main/10
      ">
        {/* 卡片內容 */}
        <div>
          <span className="
            inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase rounded-full
            bg-main/10 text-main border border-main/20
          ">
            {tag}
          </span>
          <h3 className="text-xl font-bold text-fg mb-3 group-hover:text-main transition-colors">
            {title}
          </h3>
          <p className="text-muted leading-relaxed">
            {desc}
          </p>
        </div>

        {/* 底部裝飾 (選用)：加一個箭頭讓它更像連結 */}
        <div className="mt-6 flex items-center text-main font-bold text-sm opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          了解更多 <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  )
}