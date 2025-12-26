// components/helper/graph/GraphSearch.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Circle, ArrowRight } from 'lucide-react';

const GraphSearch = ({ nodes, links, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]); // 儲存隨機推薦名單
  const wrapperRef = useRef(null);

  // 1. 點擊外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // --- [功能] 產生隨機推薦名單 ---
  // 這是一個獨立函式，被觸發時才會執行
  const refreshRecommendations = () => {
    if (!nodes || nodes.length === 0) return;
    
    // 隨機洗牌並取前 5 個
    const shuffled = [...nodes].sort(() => 0.5 - Math.random());
    const randomNodes = shuffled.slice(0, 5).map(n => ({ 
      type: 'node', 
      data: n 
    }));
    
    setRecommendations(randomNodes);
  };

  // --- [邏輯] 決定顯示的列表內容 ---
  // 如果有 query -> 顯示搜尋結果
  // 如果無 query -> 顯示 recommendations 狀態
  const displayResults = useMemo(() => {
    if (!query) {
      return recommendations;
    }

    const lowerQuery = query.toLowerCase();

    // 搜尋節點
    const matchedNodes = nodes
      .filter(n => n.id.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .map(n => ({ type: 'node', data: n }));

    // 搜尋連線
    const matchedLinks = links
      .filter(l => {
         const sid = typeof l.source === 'object' ? l.source.id : l.source;
         const tid = typeof l.target === 'object' ? l.target.id : l.target;
         const linkId = l.id || `${sid} > ${tid}`;
         return linkId.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 3)
      .map(l => ({ type: 'link', data: l }));

    return [...matchedNodes, ...matchedLinks];
  }, [query, nodes, links, recommendations]);

  // 處理點擊輸入框 (刷新推薦 + 開啟選單)
  const handleInputInteraction = () => {
    // 只有在「沒有輸入文字」的時候才刷新推薦，避免打字打一半被洗掉
    // 或是：如果你希望每次點回來都刷新，可以把 if (!query) 拿掉
    if (!query) {
      refreshRecommendations();
    }
    setIsOpen(true);
  };

  const handleSelect = (result) => {
    setQuery(result.type === 'node' ? result.data.id : (result.data.id || 'Link'));
    setIsOpen(false);
    if (onSelect) onSelect(result);
  };

  const handleClear = () => {
    setQuery('');
    refreshRecommendations(); // 清除時也順便換一批新的推薦
    setIsOpen(true); // 保持開啟讓使用者看推薦
  };

  return (
    <div ref={wrapperRef} className="absolute top-4 left-4 z-40 w-72">
      {/* 搜尋框 */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-white/40 group-focus-within:text-[#457B9D] transition-colors" />
        </div>
        
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2.5 bg-[#2a2a30]/90 backdrop-blur-md border border-white/10 rounded-lg 
                     text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#457B9D] focus:ring-1 focus:ring-[#457B9D] 
                     shadow-lg transition-all"
          placeholder="Search Node or Link ID..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          // 2. 點擊或聚焦時刷新推薦
          onClick={handleInputInteraction}
          onFocus={handleInputInteraction}
        />

        {query && (
          <button 
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 下拉選單 */}
      {isOpen && displayResults.length > 0 && (
        <ul className="absolute mt-2 w-full bg-[#2a2a30] border border-white/10 rounded-lg shadow-xl max-h-80 overflow-y-auto overflow-x-hidden">
          
          {/* 選項標題 (可選：區分這是搜尋結果還是推薦) */}
          <li className="px-4 py-2 text-[10px] text-white/30 font-bold uppercase tracking-wider border-b border-white/5">
             {query ? 'Search Results' : 'Suggested Nodes'}
          </li>

          {displayResults.map((item, idx) => {
            const isNode = item.type === 'node';
            // 處理顯示文字
            const label = isNode 
              ? item.data.id 
              : (item.data.id || `${item.data.source.id || item.data.source} → ${item.data.target.id || item.data.target}`);
            
            // 3. 視覺樣式統一：使用一般選項的樣式 (顏色圓點)
            return (
              <li 
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors group"
              >
                {/* Icon: 使用該節點的顏色 (item.data.col) */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isNode ? 'bg-white/5' : 'bg-orange-500/10'}`}>
                  {isNode ? (
                    <Circle size={14} color={item.data.col || "#457B9D"} fill={item.data.col || "#457B9D"} />
                  ) : (
                    <ArrowRight size={14} className="text-orange-400" />
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-white font-medium truncate">
                    {label}
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-wider">
                     {item.type}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GraphSearch;