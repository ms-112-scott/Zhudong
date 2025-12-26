// components/helper/graph/InfoCard.js
import React, { useMemo } from 'react';
import { ChevronRight, Play, FileText, Link as LinkIcon } from 'lucide-react';

const InfoCard = ({ node, onClose, graphData, onNodeClick }) => {
  const isOpen = !!node;

  // --- 1. 找出相關連線並依照 Group 分組 ---
  const groupedConnections = useMemo(() => {
    if (!node || !graphData || !graphData.links) return {};

    const nodeMap = new Map(graphData.nodes.map(n => [n.id, n]));
    const groups = {};

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      let neighborId = null;
      if (sourceId === node.id) neighborId = targetId;
      else if (targetId === node.id) neighborId = sourceId;

      if (neighborId) {
        const neighborNode = nodeMap.get(neighborId);
        const groupName = neighborNode?.group || 'Other';

        if (!groups[groupName]) groups[groupName] = [];

        groups[groupName].push({
          neighborId: neighborId,
          label: link.info || link.relationship || link.label || 'connected',
          color: neighborNode?.col || '#999'
        });
      }
    });
    return groups;
  }, [node, graphData]);

  // --- 2. 文字超連結處理器 ---
  const renderHyperlinkedText = (text) => {
    if (!text || !graphData || !graphData.nodes) return text;
    const nodeIds = new Set(graphData.nodes.map(n => n.id));
    const parts = text.split(/(\s+|[.,;!?])/g); // 簡單分割

    return parts.map((part, index) => {
      const cleanPart = part.trim();
      if (nodeIds.has(cleanPart)) {
        return (
          <span 
            key={index}
            onClick={() => handleLinkClick(cleanPart)}
            className="text-[#457B9D] font-bold cursor-pointer hover:underline hover:text-[#A8DADC] transition-colors"
            title={`跳轉至節點: ${cleanPart}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleLinkClick = (targetId) => {
    if (!graphData || !onNodeClick) return;
    const targetNode = graphData.nodes.find(n => n.id === targetId);
    if (targetNode) onNodeClick(targetNode);
  };

  const groupNames = Object.keys(groupedConnections).sort();

  return (
    <>
      <div 
        className={`fixed top-0 pt-20 right-0 h-full w-full md:w-120 bg-[#2a2a30] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
            onClick={onClose}
            className="absolute top-1/2 -left-8 w-8 h-16 bg-[#2a2a30] border-l border-y border-white/10 rounded-l-xl flex items-center justify-center 
                       cursor-pointer text-white/50 hover:text-white hover:bg-[#3a3a40] transition-colors focus:outline-none transform -translate-y-1/2"
        >
            <ChevronRight size={24} />
        </button>

        {node && (
          <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
            
            <div className="p-8 space-y-6 grow w-full">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#457B9D] font-mono text-sm tracking-wider">
                    {node.year ? `${node.year} YEAR` : 'CONCEPT'}
                  </span>
                  <div className="h-px bg-white/10 grow" />
                </div>
                
                {/* === [修改 1] 標題與 Tag 區域 === */}
                {/* 移除 h2 的 mb-4，改用外層 gap-3 來控制間距，並加入 items-center 垂直置中 */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                   <h2 className="text-3xl font-bold text-white leading-none">
                     {node.id}
                   </h2>
                   
                   {/* Group Tag */}
                   <span 
                      className="px-2 py-1 rounded text-xs border font-bold shadow-sm whitespace-nowrap"
                      style={{ 
                        color: node.col,                 
                        borderColor: `${node.col}66`,    // 增加一點不透明度讓邊框更清楚 (40% alpha)
                        backgroundColor: `${node.col}1A` // 很淡的背景 (10% alpha)
                      }}
                   >
                      {node.group}
                   </span>
                </div>
              </div>

              {/* 描述區塊 */}
              <div className="prose prose-invert prose-sm text-white/70 leading-relaxed wrap-break-word whitespace-pre-wrap w-full">
                  <p>
                    {renderHyperlinkedText(node.info || node.desc || "暫無詳細描述")}
                  </p>
              </div>

              {/* 關聯節點列表 */}
              {groupNames.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 w-full">
                  <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <LinkIcon size={16} /> 關聯節點
                  </h4>
                  
                  <div className="space-y-6">
                    {groupNames.map(groupName => (
                      <div key={groupName} className="relative">
                        <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: groupedConnections[groupName][0]?.color || '#999' }}></span>
                          {groupName}
                        </h5>
                        
                        <ul className="space-y-3 pl-2 border-l border-white/5 ml-0.5">
                          {groupedConnections[groupName].map((conn, idx) => (
                            <li key={idx} className="flex items-start text-sm group pl-3 relative w-full">
                               {/* 小圓點 */}
                               <span 
                                  className="absolute -left-1.25 top-2 w-2 h-2 rounded-full border border-[#2a2a30]" 
                                  style={{ backgroundColor: conn.color }}
                               />

                               {/* === [修改 2] Label === */}
                               <span className="flex-1 min-w-0 text-white/40 font-mono text-xs pt-0.5  wrap-break-word leading-tight pr-2 ">
                                 {conn.label}
                               </span>
                               
                               <span className="text-white/20 mx-1 pt-0.5 shrink-0">→</span>
                               
                               {/* === [修改 3] Node Name === */}
                               <button 
                                 onClick={() => handleLinkClick(conn.neighborId)}
                                 className="flex-1 min-w-0 text-[#457B9D] font-bold hover:text-[#A8DADC] hover:underline text-left transition-colors wrap-break-word leading-tight pl-2"
                               >
                                 {conn.neighborId}
                               </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 外部連結 */}
              <div className="pt-6">
                 <h4 className="text-white font-bold mt-2 mb-2">相關文獻</h4>
                 <ul className="space-y-2">
                   <li><a href="#" className="text-[#457B9D] hover:underline">外部文獻連結 A</a></li>
                 </ul>
              </div>
            </div>

            {/* 下半部：多媒體區塊 */}
            <div className="relative w-full aspect-video bg-black/40 shrink-0 border-t border-white/10">
              {node.mediaType === 'video' ? (
                 <div className="w-full h-full flex items-center justify-center group cursor-pointer">
                    <img src={node.img || "/api/placeholder/400/320"} alt="video cover" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Play fill="white" className="ml-1" size={32} />
                        </div>
                    </div>
                 </div>
              ) : node.mediaType === 'image' ? (
                 <img src={node.img || "/api/placeholder/400/320"} alt={node.label} className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                    <FileText size={48} className="mb-2" />
                    <span className="text-sm">No Media Available</span>
                 </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default InfoCard;