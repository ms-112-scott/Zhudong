import React from 'react'
import Navbar from '../components/global/Navbar'
import Footer from '../components/global/Footer'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {

  const location = useLocation();
  // 判斷目前是否在知識圖譜頁面
  const isGraphPage = location.pathname === '/KnowledgeGraphPage';

  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 1. 頂部導航列 (固定存在) */}
      <Navbar />

      {/* 2. 中間變動內容區塊 */}
      {/* flex-grow 會讓這塊區域自動撐開，把 Footer 推到底部 */}
      <main className="flex-grow">{children}</main>

      {/* 3. 底部版權宣告 (固定存在) */}
      <Footer />
    </div>
  )
}

export default Layout
