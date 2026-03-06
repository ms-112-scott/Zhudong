import React from 'react';

export const TimelineSlider = ({ range, current, onChange, onCommit }) => {
  const min = range[0] || 1900;
  const max = range[1] || 2024;

  // 計算百分比位置 (用於背景進度條)
  const getPercent = (value) => ((value - min) / (max - min)) * 100;

  return (
    <div className="bg-[#111115]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest block mb-1">Temporal Scope</span>
          <h4 className="text-xl font-mono font-light text-white leading-none">
            {current[0]} <span className="text-white/20 mx-2">—</span> {current[1]}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-white/30 uppercase font-mono">System Clock: Synchronized</span>
        </div>
      </div>

      <div className="relative h-12 flex items-center group">
        {/* 自定義滑軌背景 */}
        <div className="absolute w-full h-0.5 bg-white/5 rounded-full" />
        
        {/* 活性範圍指示 */}
        <div 
          className="absolute h-0.5 bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          style={{ 
            left: `${getPercent(current[0])}%`, 
            right: `${100 - getPercent(current[1])}%` 
          }} 
        />

        {/* 標準 HTML Range Input (隱藏原生樣式，僅作互動) */}
        {/* 注意：這裡為了簡化使用兩個 Input，實際專案建議使用如 rc-slider 等庫 */}
        <input
          type="range"
          min={min}
          max={max}
          value={current[0]}
          onChange={(e) => onChange([parseInt(e.target.value), current[1]])}
          onMouseUp={() => onCommit(current)}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-30"
          style={{ 
            /* 需在 CSS 中隱藏 thumb 或調整樣式 */ 
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={current[1]}
          onChange={(e) => onChange([current[0], parseInt(e.target.value)])}
          onMouseUp={() => onCommit(current)}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-30"
        />

        {/* 時間刻度標記 */}
        <div className="absolute top-8 w-full flex justify-between px-1">
          {[min, Math.floor((min + max) / 2), max].map(year => (
            <span key={year} className="text-[9px] font-mono text-white/20">{year}</span>
          ))}
        </div>
      </div>
    </div>
  );
};