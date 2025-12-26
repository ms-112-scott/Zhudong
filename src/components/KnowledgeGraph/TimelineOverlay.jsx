// components/TimelineOverlay.jsx
import React from 'react';

export const TimelineOverlay = ({ visible }) => {
  if (!visible) return null;
  
  return (
    // 改為垂直排列 (flex-col)，位置靠左 (left-5)
    <div className="absolute top-0 left-5 h-full py-[10%] flex flex-col justify-between text-white/10 text-xs pointer-events-none uppercase tracking-[0.3em] font-light z-10 transition-opacity duration-1000 writing-vertical-lr">
       {/* 寫入模式改為直書，或者單純旋轉文字 */}
       <span className="-rotate-90 origin-left translate-y-10">Past (過去) ↑</span>
       <span className="-rotate-90 origin-left">Present (現代) ↓</span>
    </div>
  );
};