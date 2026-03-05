import React, { useState, useMemo, useRef } from 'react';
import { Link as LinkIcon } from 'lucide-react';

const ConnectionTags = ({ groupedConnections, onNodeClick }) => {
  const [hoveredData, setHoveredData] = useState(null);
  const closeTimerRef = useRef(null);

  const allConnections = useMemo(() => {
    return Object.entries(groupedConnections).flatMap(([groupName, conns]) =>
      conns.map(conn => ({ ...conn, groupName }))
    );
  }, [groupedConnections]);

  const handleMouseEnter = (conn) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setHoveredData(conn);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredData(null);
    }, 1500);
  };

  if (allConnections.length === 0) return null;

  return (
    <div className="pt-2 w-full relative">
      <h4 className="text-white/40 text-[10px] font-bold mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
        <LinkIcon size={12} /> 關聯節點
      </h4>

      {/* 標籤容器 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {allConnections.map((conn, idx) => (
          <button
            key={`${conn.neighborId}-${idx}`}
            onMouseEnter={() => handleMouseEnter(conn)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onNodeClick(conn.neighborId)}
            // 移除 gap-1.5 (因為沒圓點了)，微調 px-3 讓比例更好看
            className="px-3 py-0.5 rounded-full text-[11px] font-semibold transition-all border active:scale-95 whitespace-nowrap"
            style={{
              backgroundColor: hoveredData?.neighborId === conn.neighborId ? `${conn.color}25` : `${conn.color}10`,
              borderColor: hoveredData?.neighborId === conn.neighborId ? conn.color : `${conn.color}40`,
              color: conn.color,
              boxShadow: hoveredData?.neighborId === conn.neighborId ? `0 0 10px ${conn.color}30` : 'none'
            }}
          >
            {conn.neighborId}
          </button>
        ))}
      </div>

      {/* 浮動描述區域 - 絕對定位 */}
      <div 
        className={`absolute left-0 right-0 z-20 pointer-events-none transition-all duration-300 ease-out ${
          hoveredData ? 'opacity-100 translate-y-1' : 'opacity-0 translate-y-0'
        }`}
        style={{ top: 'calc(100% + 4px)' }}
      >
        <div 
          className="bg-[#2a2a30]/95 border border-white/10 rounded-md p-2.5 shadow-2xl flex items-start backdrop-blur-md"
          style={{ 
            visibility: hoveredData ? 'visible' : 'hidden',
            borderLeft: hoveredData ? `3px solid ${hoveredData.color}` : '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {hoveredData && (
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-tighter text-white/30 mb-0.5 font-bold">
                {hoveredData.groupName}
              </div>
              <div className="text-[11px] text-[#A8DADC] leading-snug italic">
                {hoveredData.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTags;