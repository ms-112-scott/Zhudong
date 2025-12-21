import { useState } from 'react'
// 1. 引入 React Router 必要元件
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './App.css'

// 引入頁面元件
import HomePage from './PageLayout/HomePage'
import Layout from './PageLayout/Layout'
import KnowledgeGraphPage from './PageLayout/KnowledgeGraphPage'
import { GraphProvider } from './components/KnowledgeGraph/GraphProvider'

// 實際上你應該會在 src/pages/ 下建立這些檔案
const EducationPage = () => <div className="p-20 text-fg min-h-screen bg-surface">這是文化教案頁面</div>
const WorkshopPage = () => <div className="p-20 text-fg min-h-screen bg-surface">這是共創工作坊頁面</div>


function App() {
  return (
    <BrowserRouter>
      <Layout>
          <GraphProvider>
          <Routes>
            {/* 3. 設定首頁 */}
            <Route path="/" element={<HomePage />} />

            {/* 4. 設定路徑 */}
            <Route path="/KnowledgeGraphPage" element={<KnowledgeGraphPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/workshop" element={<WorkshopPage />} />
            
            {/* 之後可以繼續新增更多頁面 */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
          </Routes>
          </GraphProvider>
      </Layout>
    </BrowserRouter>
  )
}

export default App