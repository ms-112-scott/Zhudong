import { useState } from 'react'
// 修正：統一使用 HashRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'

// 引入頁面元件
import HomePage from './PageLayout/HomePage'
import Layout from './PageLayout/Layout'
import KnowledgeGraphPage from './PageLayout/KnowledgeGraphPage'
import { GraphProvider } from './components/KnowledgeGraph/GraphProvider'

// 頁面元件定義
const EducationPage = () => <div className="p-20 text-fg min-h-screen bg-surface">這是文化教案頁面</div>
const WorkshopPage = () => <div className="p-20 text-fg min-h-screen bg-surface">這是共創工作坊頁面</div>

function App() {
  return (
    // 將 BrowserRouter 改為 Router (即上面引入的 HashRouter)
    <Router>
      <Layout>
        {/* 將 Provider 放在 Layout 內，這樣所有頁面都能共享資料 */}
        <GraphProvider>
          <Routes>
            {/* 設定首頁 */}
            <Route path="/" element={<HomePage />} />

            {/* 設定路徑 */}
            <Route path="/KnowledgeGraphPage" element={<KnowledgeGraphPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/workshop" element={<WorkshopPage />} />
          </Routes>
        </GraphProvider>
      </Layout>
    </Router>
  )
}

export default App