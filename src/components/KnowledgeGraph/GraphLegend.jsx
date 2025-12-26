import React, { useState } from 'react';
import { useGraphData } from './GraphProvider';

// [修改] 接收 onLegendClick prop
export const GraphLegend = ({ onLegendClick }) => {
  const { graphData } = useGraphData();
  const legendData = graphData?.legend || [];
  
  // [新增] 記錄目前選中的群組 (null 代表全顯示)
  const [activeGroup, setActiveGroup] = useState(null);

  if (legendData.length === 0) return null;

  // [新增] 處理點擊邏輯
  const handleClick = (groupLabel) => {
    // 如果點擊的是「已經選中」的，代表要取消 (toggle off)
    const newGroup = activeGroup === groupLabel ? null : groupLabel;
    
    setActiveGroup(newGroup);
    
    // 通知父層 (KnowledgePage -> ForceGraph)
    if (onLegendClick) {
      onLegendClick(newGroup);
    }
  };

  return (
    // [修改] pointer-events-none 改為 pointer-events-auto 或是確保內部按鈕可點
    // 這裡建議外層保留 none 以免擋住背後的圖，內層 card 開啟 auto
    <div className="absolute bottom-8 left-8 z-30 pointer-events-none select-none min-w-max">
      
      {/* 內層 Card 開啟 pointer-events-auto */}
      <div className="bg-[#1e1e23]/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl pointer-events-auto">
        
        <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
            圖譜圖例 {activeGroup && "(篩選中)"}
        </h4>
        
        <div className="flex flex-col gap-2">
          {legendData.map((item, index) => {
            // 判斷是否為「非」選中狀態 (用於變淡其他選項)
            const isDimmed = activeGroup && activeGroup !== item.label;

            return (
              <div 
                key={index} 
                onClick={() => handleClick(item.label)} // [新增] 點擊事件
                className={`flex items-center gap-3 cursor-pointer transition-all duration-300 group ${
                    isDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'
                }`}
              >
                {/* 顏色圓點 */}
                <span 
                  className={`w-3 h-3 rounded-full shadow-sm transition-transform duration-300 ${
                      activeGroup === item.label ? 'scale-125 ring-2 ring-white/30' : 'group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: item.color }}
                />
                
                {/* 文字標籤 */}
                <span className={`text-xs font-medium tracking-wide min-w-max transition-colors ${
                    activeGroup === item.label ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* [選用] 清除篩選按鈕 (當有選取時顯示) */}
        {activeGroup && (
            <div 
                onClick={() => handleClick(activeGroup)} // 再次點擊當前群組即取消
                className="mt-3 pt-2 border-t border-white/10 text-center cursor-pointer"
            >
                <span className="text-[10px] text-white/40 hover:text-white transition-colors">
                    重置篩選
                </span>
            </div>
        )}
      </div>
    </div>
  );
};