import React, { createContext, useState, useEffect, useContext } from 'react';

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = "https://script.google.com/macros/s/AKfycbxeqaBIYsX9o9W8T9Md4vv24X5iGhdke4kC2OOyIitj6wWO-1XAfPctV8cIgoyezxFy/exec";

  useEffect(() => {
    const fetchData = async () => {
      // 如果已經有資料了就不重複抓取
      if (graphData) return; 

      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.nodes && data.links) {
          setGraphData(data);
        }
      } catch (error) {
        console.error("背景抓取失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GraphContext.Provider value={{ graphData, isLoading }}>
      {children}
    </GraphContext.Provider>
  );
};

// 方便子組件調用的 Hook
export const useGraphData = () => useContext(GraphContext);