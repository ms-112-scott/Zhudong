import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';

export default function Gallery() {
 const { images, loading } = useData(); // 直接取得全域資料

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">正在載入歷史影像...</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 p-4">
  {images.map((img, index) => (
    <div key={img.img_id || index} className="group border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-video bg-gray-100">
       <img 
        // 將 uc?export=view 改為 thumbnail 格式，sz=1000 代表寬度限制在 1000px 以內
        src={`https://drive.google.com/thumbnail?id=${img.img_id}&sz=w1000`} 
        alt={img.file_name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=圖片載入失敗"; }}
/>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate flex-1" title={img.file_name}>
            {img.file_name.replace(/\.[^/.]+$/, "")} {/* 移除副檔名讓視覺更乾淨 */}
          </h3>
          {img.node_id && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
              ID: {img.node_id}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{img.info || "暫無簡介"}</p>
      </div>
    </div>
  ))}
</div>
  );
}

