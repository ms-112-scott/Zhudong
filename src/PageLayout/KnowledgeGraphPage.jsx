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
        </div>
      )}

      {/* 圖表畫布 */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-all duration-1000 ${isLoading ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
      />

      {!isLoading && filteredData && (
        <>
          <div className="absolute top-20 left-2 z-100  pointer-events-auto shadow-2xl">
            <GraphSearch
              nodes={filteredData.nodes}
              links={filteredData.links}
              onSelect={handleSearchSelect}
            />
          </div>

          <GraphToolbar
            onZoomFit={actions.zoomToFit}
            yearRange={globalYearRange}
            currentRange={displayYearRange}
            onRangeChange={actions.setDisplayYearRange}
            onRangeCommit={actions.setFilterYearRange}
          />

          <GraphLegend onLegendClick={actions.highlightGroup} />

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