import React, { useEffect, useRef, useState } from 'react';
import { ForceGraph } from "../components/helper/ForceGraph"; 
import InfoCard from '../components/KnowledgeGraph/InfoCard';
import { useGraphData } from '../components/KnowledgeGraph/GraphProvider';

const KnowledgePage = () => {
  const containerRef = useRef(null);
  const graphInstance = useRef(null);
  const [hoveredNodeData, setHoveredNodeData] = useState(null);
  
  // 從 Context 取得全局資料、讀取狀態與錯誤訊息
  const { graphData, isLoading, error } = useGraphData();

  /**
   * 圖譜生命週期管理
   * 負責 D3 實例的初始化、資料渲染與資源回收
   */
  useEffect(() => {
    // 只有在資料存在且容器 DOM 已掛載時才執行
    if (!graphData || !containerRef.current) return;

    const { offsetWidth, offsetHeight } = containerRef.current;

    // 1. 初始化 ForceGraph 實例
    graphInstance.current = new ForceGraph(containerRef.current, {
      width: offsetWidth,
      height: offsetHeight,
      onNodeHover: setHoveredNodeData // 將 Hover 狀態回傳給 React 管理
    });

    // 2. 執行首次渲染
    graphInstance.current.render(graphData);

    // 3. 響應式佈局處理
    const handleResize = () => {
      if (graphInstance.current && containerRef.current) {
        const { offsetWidth: w, offsetHeight: h } = containerRef.current;
        graphInstance.current.resize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    // 4. 清除機制 (Cleanup)
    return () => {
      if (graphInstance.current) graphInstance.current.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData]); // 依賴項為 graphData，當 Context 下載完資料後會自動觸發

  /**
   * 介面互動：縮放至全圖
   */
  const handleZoomToFit = () => {
    if (graphInstance.current) {
      graphInstance.current.zoomToFit();
    }
  };

  // --- 錯誤處理介面 ---
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e23] text-red-400">
        <p>資料讀取失敗：{error.message}</p>
      </div>
    );
  }
  
  /**
   * 導覽列自動隱藏與偵測顯示邏輯
   */
  useEffect(() => {
    // 進入頁面預設隱藏
    document.body.classList.add('hide-layout');

    const handleMouseMove = (e) => {
      // 如果滑鼠位置距離視窗頂部小於 50px
      if (e.clientY < 50) {
        document.body.classList.remove('hide-layout');
      } else {
        document.body.classList.add('hide-layout');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      // 離開頁面恢復顯示並移除監聽
      document.body.classList.remove('hide-layout');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-[#1e1e23] overflow-hidden z-0">
      
      {/* 1. 載入中遮罩 (當 Context 尚未抓完資料時顯示) */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-20 bg-[#1e1e23]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-500 border-t-white rounded-full animate-spin"></div>
            <p className="text-gray-400 tracking-wider font-light">正在初始化知識網路...</p>
          </div>
        </div>
      )}

      {/* 2. 右上角工具列 (只有在資料載入後才出現) */}
      {!isLoading && graphData && (
        <div className="absolute top-20 right-5 z-30 flex flex-col gap-2">
          <button 
            onClick={handleZoomToFit}
            className="p-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-all shadow-xl active:scale-95 group"
            title="縮放至全圖"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      )}

      {/* 3. D3 圖譜畫布容器 */}
      <div 
        ref={containerRef} 
        className={`w-full h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {/* 4. 節點詳情卡片 */}
      {hoveredNodeData && (
        <InfoCard hoveredNodeData={hoveredNodeData} />
      )}
    </div>
  );
};

export default KnowledgePage;