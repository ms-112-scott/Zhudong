import React, { createContext, useState, useEffect, useContext } from 'react';

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://script.google.com/macros/s/AKfycbxeqaBIYsX9o9W8T9Md4vv24X5iGhdke4kC2OOyIitj6wWO-1XAfPctV8cIgoyezxFy/exec";

  useEffect(() => {
    const fetchData = async () => {
      // 避免重複抓取
      if (graphData) return; 

      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.nodes && data.links) {
          // --- 資料清洗邏輯開始 ---
          
          // 1. 處理 Nodes：確保 ID 為字串格式
          const cleanNodes = data.nodes.map(node => ({
             ...node,
             id: String(node.id) // 強制轉字串
          }));

          // 2. 建立 ID 索引 (使用 Set 加速查詢)
          const validNodeIds = new Set(cleanNodes.map(n => n.id));

          // 3. 處理 Links：過濾掉端點不存在的連線
          const cleanLinks = data.links.filter(link => {
            const sourceId = String(link.source);
            const targetId = String(link.target);

            // 檢查兩端是否都存在
            const isValid = validNodeIds.has(sourceId) && validNodeIds.has(targetId);
            return isValid;
          }).map(link => ({
             ...link,
             source: String(link.source), // 同步轉為字串
             target: String(link.target)
          }));

          // 4. [新增] 處理 Legend (確保是陣列)
          // 如果後端還沒準備好 legend，就給空陣列避免前端報錯
          const cleanLegend = Array.isArray(data.legend) ? data.legend : [];

          // --- 資料清洗邏輯結束 ---

          // 更新狀態：包含 nodes, links 以及 legend
          setGraphData({
            nodes: cleanNodes,
            links: cleanLinks,
            legend: cleanLegend // <--- 把圖例資料存入 State
          });

        } else {
            throw new Error("API 回傳格式錯誤：缺少 nodes 或 links");
        }

      } catch (err) {
        console.error("背景抓取失敗:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GraphContext.Provider value={{ graphData, isLoading, error }}>
      {children}
    </GraphContext.Provider>
  );
};

// 方便子組件調用的 Hook
export const useGraphData = () => useContext(GraphContext);