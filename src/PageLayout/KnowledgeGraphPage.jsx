import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ForceGraph } from '../components/KnowledgeGraph/Graph/ForceGraph';
import InfoCard from '../components/KnowledgeGraph/InfoCard'; 
import { useGraphData } from '../components/KnowledgeGraph/GraphProvider';
import { GraphToolbar } from '../components/KnowledgeGraph/GraphToolbar';
import { GraphLegend } from '../components/KnowledgeGraph/GraphLegend';
import GraphSearch from '../components/KnowledgeGraph/GraphSearch'; // [新增] 引入搜尋組件

const KnowledgePage = () => {
  const containerRef = useRef(null);
  const graphInstanceRef = useRef(null);
  
  // --- 狀態管理 ---
  const [selectedNode, setSelectedNode] = useState(null);
  const { graphData, isLoading, error } = useGraphData();

  // 時間軸狀態
  const [globalYearRange, setGlobalYearRange] = useState([1900, 2030]); 
  const [displayYearRange, setDisplayYearRange] = useState([1900, 2030]);
  const [filterYearRange, setFilterYearRange] = useState([1900, 2030]);

  // --- 處理節點點擊 (共用) ---
  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  // --- [新增] 處理搜尋選擇 ---
  const handleSearchSelect = (result) => {
    if (!graphInstanceRef.current) return;

    if (result.type === 'node') {
      const node = result.data;
      
      // 1. 設定選中狀態 (讓 InfoCard 跳出來)
      setSelectedNode(node);
      
      // 2. 呼叫 D3 Zoom 飛行到該節點
      graphInstanceRef.current.zoomToNode(node.id);
      
    } else if (result.type === 'link') {
      // 如果搜尋到的是 link，我們聚焦到 source 節點
      const link = result.data;
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      
      graphInstanceRef.current.zoomToNode(sourceId);
      // 選擇性：是否要選取 source node?
      // const sourceNode = filteredData.nodes.find(n => n.id === sourceId);
      // if (sourceNode) setSelectedNode(sourceNode);
    }
  };

  // --- 同步 React State 到 Graph Visual ---
  useEffect(() => {
    if (graphInstanceRef.current) {
      if (selectedNode) {
        // 如果有選中，觸發 ForceGraph 的高亮邏輯
        graphInstanceRef.current.highlightNode(selectedNode);
      } else {
        // 如果沒選中（例如關閉卡片），重置圖表
        graphInstanceRef.current.resetHighlight();
      }
    }
  }, [selectedNode]);

  // --- UI 自動隱藏邏輯 ---
  useEffect(() => {
    document.body.classList.add('hide-layout');
    
    const handleMouseMove = (e) => {
      const showThreshold = 60;
      // 搜尋框在左上角，工具列在右上角，滑鼠在頂部時顯示
      if (selectedNode) {
          document.body.classList.remove('hide-layout');
          return;
      }
      if (e.clientY < showThreshold) {
        document.body.classList.remove('hide-layout');
      } else {
        document.body.classList.add('hide-layout');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.body.classList.remove('hide-layout');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedNode]);

  // --- A. 計算年份邊界 ---
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      const allYears = [];
      graphData.nodes.forEach(n => {
        const s = parseInt(n.start_year);
        const e = parseInt(n.end_year);
        if (!isNaN(s)) allYears.push(s);
        if (!isNaN(e)) allYears.push(e);
      });

      if (allYears.length > 0) {
        const min = Math.min(...allYears);
        const max = Math.max(...allYears);
        setGlobalYearRange([min, max]);
        setDisplayYearRange([min, max]); 
        setFilterYearRange([min, max]);
      }
    }
  }, [graphData]);

  // --- B. 資料過濾邏輯 ---
  const filteredData = useMemo(() => {
    if (!graphData) return null;

    const [sliderMin, sliderMax] = filterYearRange;

    const validNodes = graphData.nodes.filter(node => {
      if (!node.start_year) return false;
      const nodeStart = parseInt(node.start_year);
      const nodeEnd = node.end_year ? parseInt(node.end_year) : nodeStart;
      if (isNaN(nodeStart)) return false;
      return (nodeStart <= sliderMax) && (nodeEnd >= sliderMin);
    });

    const validNodeIds = new Set(validNodes.map(n => n.id));
    const validLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
    });

    return { nodes: validNodes, links: validLinks };

  }, [graphData, filterYearRange]);

  // --- C. D3 實例初始化與渲染 ---
  useEffect(() => {
    if (!filteredData || !containerRef.current) return;
    
    if (!graphInstanceRef.current) {
      const graph = new ForceGraph(containerRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        onNodeClick: handleNodeClick, // 傳遞點擊處理
        onBackgroundClick: () => setSelectedNode(null), // 背景點擊清除
      });
      graphInstanceRef.current = graph;
    }

    graphInstanceRef.current.render(filteredData);

  }, [filteredData]);

  // --- D. Resize ---
  useEffect(() => {
    const handleResize = () => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (graphInstanceRef.current) graphInstanceRef.current.destroy();
    };
  }, []);

  // --- E. Legend Click ---
  // [新增] 處理圖例點擊
  const handleLegendClick = (groupName) => {
    if (graphInstanceRef.current) {
      // 呼叫剛剛在 ForceGraph 新增的方法
      graphInstanceRef.current.highlightGroup(groupName);
      
      // 如果點擊圖例時有選中的節點 (InfoCard 開著)，建議先關閉它，避免視覺衝突
      if (selectedNode) {
        setSelectedNode(null);
      }
    }
  };

  const handleZoomToFit = () => graphInstanceRef.current?.zoomToFit();

  if (error) return <div className="p-20 text-red-400">Error: {error.message}</div>;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-[#1e1e23] overflow-hidden z-0">
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#1e1e23]">
           <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* D3 Canvas Container */}
      <div ref={containerRef} className={`w-full h-full block transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />

      {!isLoading && filteredData && (
        <>
          {/* 1. [新增] 搜尋列 (放在左上角) */}
          <div className="absolute top-15 left-5 z-40">
             <GraphSearch 
                nodes={filteredData.nodes} // 傳入過濾後的資料，避免搜尋到隱藏節點
                links={filteredData.links} 
                onSelect={handleSearchSelect} 
             />
          </div>

          {/* 2. 工具列 (Toolbar) */}
          <div className={`absolute top-5 right-5 z-40 transition-transform duration-500 ease-in-out `}>
            <GraphToolbar 
              onZoomFit={handleZoomToFit} 
              yearRange={globalYearRange}
              currentRange={displayYearRange} 
              onRangeChange={setDisplayYearRange}
              onRangeCommit={(val) => {
                  setFilterYearRange(val); 
                  setDisplayYearRange(val); 
              }}
            />
          </div>

          {/* 3. 圖例 (Legend) */}
          <div className="absolute bottom-5 left-5 z-30 pointer-events-none">
             <div className="pointer-events-auto">
                <GraphLegend onLegendClick={handleLegendClick} />
             </div>
          </div>

          {/* 4. 資訊卡 (InfoCard) */}
          <InfoCard 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            graphData={graphData} // 這裡傳完整資料給 InfoCard，方便它查找完整關係
            onNodeClick={(n) => {
                // 當從 InfoCard 點擊其他節點時，也要觸發 Zoom
                handleNodeClick(n);
                if (graphInstanceRef.current) {
                    graphInstanceRef.current.zoomToNode(n.id);
                }
            }}
          />
        </>
      )}
    </div>
  );
};

export default KnowledgePage;