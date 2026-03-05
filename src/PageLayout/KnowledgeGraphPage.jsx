import React, { useRef } from 'react';
import InfoCard from '../components/KnowledgeGraph/InfoCard'; 
import { useGraphData } from '../components/KnowledgeGraph/GraphProvider';
import { GraphToolbar } from '../components/KnowledgeGraph/GraphToolbar';
import { GraphLegend } from '../components/KnowledgeGraph/GraphLegend';
import GraphSearch from '../components/KnowledgeGraph/GraphSearch';
import FilteredGraphLogger from '../components/KnowledgeGraph/FilteredGraphLogger';
import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';

const KnowledgePage = () => {
  const containerRef = useRef(null);
  const { graphData, isLoading, error } = useGraphData();

  const {
    filteredData,
    selectedNode,
    globalYearRange,
    displayYearRange,
    actions
  } = useKnowledgeGraph(graphData, containerRef);

  const handleSearchSelect = (result) => {
    const node = result.type === 'node' ? result.data : result.data.source;
    const nodeId = typeof node === 'object' ? node.id : node;
    if (result.type === 'node') actions.setSelectedNode(result.data);
    actions.zoomToNode(nodeId);
  };

  if (error) return <div className="p-20 text-red-400">Error: {error.message}</div>;

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
      <FilteredGraphLogger data={filteredData} targetId="張乾榮" />
      
      {/* Loading 狀態 */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-100 bg-[#0a0a0c]">
           <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
           <p className="text-blue-200/40 text-[10px] tracking-[0.3em] uppercase">Neural Mapping...</p>
        </div>
      )}

      {/* 圖表畫布 */}
      <div 
        ref={containerRef} 
        className={`w-full h-full transition-all duration-1000 ${isLoading ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`} 
      />

      {!isLoading && filteredData && (
        <>
          {/* --- 整合操作面板 (Unified Control Panel) --- */}
          <div className="absolute top-6 left-6 bottom-6 w-80 z-40 flex flex-col gap-4 pointer-events-none">
            
            {/* 1. 搜尋區塊 */}
            <div className="pointer-events-auto shadow-2xl">
              <GraphSearch 
                nodes={filteredData.nodes} 
                links={filteredData.links} 
                onSelect={handleSearchSelect} 
              />
            </div>

            {/* 2. 主控制面板 (分類與工具) */}
            <div className="pointer-events-auto flex-1 flex flex-col bg-[#16161a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl min-h-0">
              
              {/* 分類篩選區 (自動延展) */}
              <div className="p-6 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">Filters</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-white/30 font-mono">{filteredData.nodes.length} N</span>
                  </div>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar-minimal pr-2 grow transition-all">
                  <GraphLegend onLegendClick={actions.highlightGroup} />
                </div>
              </div>

              {/* 分隔線 */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* 視圖與年份工具區 (固定在底部) */}
              <div className="p-6 bg-white/[0.02]">
                <div className="mb-3">
                  <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black mb-4">View Control</h3>
                  <GraphToolbar 
                    onZoomFit={actions.zoomToFit} 
                    yearRange={globalYearRange}
                    currentRange={displayYearRange} 
                    onRangeChange={actions.setDisplayYearRange}
                    onRangeCommit={actions.setFilterYearRange}
                  />
                </div>
              </div>

            </div>

            {/* 底部小字提示 */}
            <div className="px-6 py-2 text-[9px] text-white/20 tracking-[0.2em] uppercase text-center">
              V 3.0 • Knowledge Engine
            </div>
          </div>

          {/* --- 右側內容卡片 --- */}
          <InfoCard 
            node={selectedNode} 
            onClose={() => actions.setSelectedNode(null)}
            graphData={graphData}
            onNodeClick={(n) => {
                actions.setSelectedNode(n);
                actions.zoomToNode(n.id);
            }}
          />
        </>
      )}
    </div>
  );
};

export default KnowledgePage;