import React, { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/ms-112-scott/Zhudong/master/src/data/images.json";

  useEffect(() => {
    // cache-busting：加時間戳繞過 raw.githubusercontent CDN cache
    fetch(`${GITHUB_JSON_URL}?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <DataContext.Provider value={{ images, loading }}>
      {children}
    </DataContext.Provider>
  );
};

// 建立一個方便使用的 Hook
export const useData = () => useContext(DataContext);