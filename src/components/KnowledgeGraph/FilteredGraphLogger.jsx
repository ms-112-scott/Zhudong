import React, { useEffect } from 'react';

/**
 * 這是一個「無介面 (Headless)」組件，專門用於 Console Log 除錯。
 * 把它放在 KnowledgePage 裡，傳入 filteredData 即可。
 */
const FilteredGraphLogger = ({ data, targetId = "Elon Musk" }) => {
  // console.log("Filter triggered");
  

  useEffect(() => {
    if (!data) return;

    // 使用 console.group 把 Log 收折起來，避免洗版
    console.groupCollapsed(`📊 Filtered Data Updated (Nodes: ${data.nodes.length}, Links: ${data.links.length})`);

    // 1. 基礎統計
    console.log("Time Range Data:", data);
    
    // 計算 Group 分佈
    const groupCounts = {};
    data.nodes.forEach(n => {
      groupCounts[n.group] = (groupCounts[n.group] || 0) + 1;
    });
    console.table(groupCounts); // 用表格顯示各類別數量

    // 2. 特定 ID 追蹤 (檢查這個人有沒有被過濾掉)
    if (targetId) {
      console.group(`🔍 Tracking ID: "${targetId}" in Filtered Set`);
      
      const foundNode = data.nodes.find(n => n.id === targetId);
      
      if (foundNode) {
        console.log(`✅ Node is VISIBLE (Present in filtered set)`, foundNode);
        
        // 檢查相關連線
        // 注意：D3 可能已經把 source/target 轉成物件，也可能還是字串，需做安全檢查
        const relatedLinks = data.links.filter(l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return s === targetId || t === targetId;
        });

        console.log(`🔗 Visible Links: ${relatedLinks.length}`, relatedLinks);
      } else {
        console.log(`❌ Node is HIDDEN (Filtered out by year range or logic)`);
      }
      console.groupEnd();
    }

    console.groupEnd();

  }, [data, targetId]); // 當 data 改變或 targetId 改變時執行

  // 這個組件不需要渲染任何 UI
  return null;
};

export default FilteredGraphLogger;