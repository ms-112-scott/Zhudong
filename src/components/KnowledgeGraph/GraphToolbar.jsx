import React, { useState } from 'react';
import { Filter, Maximize, X } from 'lucide-react';

// === 1. 修改內部 Slider 組件，加入 onCommit ===
const DualRangeSlider = ({ min, max, values, onChange, onCommit }) => {
  const [minVal, maxVal] = values;
  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="relative w-full h-12 flex items-center justify-center pt-4">
      {/* 背景與軌道 (保持不變) */}
      <div className="absolute w-full h-1 bg-white/20 rounded z-0"></div>
      <div 
        className="absolute h-1 bg-[#457B9D] z-10 rounded"
        style={{
          left: `${getPercent(minVal)}%`,
          width: `${getPercent(maxVal) - getPercent(minVal)}%`
        }}
      ></div>

      {/* 左邊滑塊 */}
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          onChange([value, maxVal]); // 即時更新 UI
        }}
        // [新增] 放開滑鼠/手指時才送出最終數值
        onMouseUp={() => onCommit([minVal, maxVal])}
        onTouchEnd={() => onCommit([minVal, maxVal])}
        className="absolute w-full h-0 z-20 outline-none pointer-events-none 
                   [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
      />

      {/* 右邊滑塊 */}
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          onChange([minVal, value]); // 即時更新 UI
        }}
        // [新增] 放開滑鼠/手指時才送出最終數值
        onMouseUp={() => onCommit([minVal, maxVal])}
        onTouchEnd={() => onCommit([minVal, maxVal])}
        className="absolute w-full h-0 z-20 outline-none pointer-events-none 
                   [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
      />
      
      {/* 文字顯示 */}
      <div className="absolute top-0 left-0 text-xs text-white/70">{minVal}</div>
      <div className="absolute top-0 right-0 text-xs text-white/70">{maxVal}</div>
    </div>
  );
};

// === 2. 修改主 Toolbar 組件，接收 onRangeCommit ===
export const GraphToolbar = ({ 
  onZoomFit, 
  yearRange,      
  currentRange,   
  onRangeChange, // 用於更新 UI
  onRangeCommit  // [新增] 用於更新圖表
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ...樣式定義保持不變...
  const btnClass = "p-3 rounded-full backdrop-blur-md border transition-all shadow-xl flex items-center justify-center text-white active:scale-95 duration-300";
  const inactiveClass = "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white";
  const activeClass = "bg-[#457B9D] border-[#457B9D] shadow-[#457B9D]/30";

  return (
    <div className="absolute top-24 right-5 z-30 flex flex-col gap-3 pointer-events-auto items-end">
      <button onClick={onZoomFit} className={`${btnClass} ${inactiveClass}`} title="縮放至全圖">
        <Maximize size={20} />
      </button>
      
      <div className="flex items-center gap-3">
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'w-64 opacity-100 mr-2' : 'w-0 opacity-0 mr-0'}`}>
          <div className="bg-[#1e1e23]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-bold">時間篩選</span>
              <span className="text-[#457B9D] text-xs font-mono">
                {currentRange[0]} - {currentRange[1]}
              </span>
            </div>
            
            {/* 傳入新的 props */}
            <DualRangeSlider 
              min={yearRange[0]} 
              max={yearRange[1]} 
              values={currentRange}
              onChange={onRangeChange} 
              onCommit={onRangeCommit}
            />
          </div>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className={`${btnClass} ${isOpen ? activeClass : inactiveClass}`} title="時間篩選">
          {isOpen ? <X size={20} /> : <Filter size={20} />}
        </button>
      </div>
    </div>
  );
};