import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import NodeHeader from './InfoCard/NodeHeader';
import NodeDescription from './InfoCard/NodeDescription';
import ConnectionTags from './InfoCard/ConnectionTags';
import MediaSection from './InfoCard/MediaSection';

const InfoCard = ({ node, onClose, graphData, onNodeClick }) => {
  const isOpen = !!node;

  const groupedConnections = useMemo(() => {
    if (!node || !graphData?.links) return {};
    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
    const groups = {};

    graphData.links.forEach((link) => {
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      let neighborId = s === node.id ? t : t === node.id ? s : null;

      if (neighborId) {
        const neighborNode = nodeMap.get(neighborId);
        const groupName = neighborNode?.group || 'Other';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push({
          neighborId,
          label: link.info || link.relationship || link.label || 'connected',
          color: neighborNode?.col || '#999',
        });
      }
    });
    return groups;
  }, [node, graphData]);

  const handleNodeJump = (id) => {
    const target = graphData.nodes.find(n => n.id === id);
    if (target && onNodeClick) onNodeClick(target);
  };
 
  

  return (
    <div
      className={`fixed top-0 pt-20 right-0 h-full w-full md:w-150 bg-[#1e1e22] border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-1/2 -left-8 w-8 h-16 bg-[#1e1e22] border-l border-y border-white/5 rounded-l-xl flex items-center justify-center cursor-pointer text-white/30 hover:text-white transition-all transform -translate-y-1/2"
      >
        <ChevronRight size={24} />
      </button>

      {node && (
        <div className="h-full flex flex-col p-8 overflow-hidden">
          {/* 1. 固定區塊：標題 */}
          <div className="shrink-0">
            <NodeHeader node={node} />
          </div>
          
          {/* 2. 固定區塊：描述 (若描述太長，此處也可視需求改為限制高度) */}
          <div className="shrink-0 mb-4">
            <NodeDescription 
              text={node.info || node.desc} 
              graphData={graphData} 
              onNodeClick={onNodeClick} 
            />
          </div>

          {/* 3. 獨立滾動區塊：關聯標籤 */}
          <div className="grow overflow-y-auto pr-2 custom-scrollbar-minimal">
            <ConnectionTags 
              groupedConnections={groupedConnections} 
              onNodeClick={handleNodeJump} 
            />
          </div>

          {/* 4. 固定區塊：媒體 */}
          <div className="shrink-0 mt-6">
            <MediaSection node={node} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoCard;