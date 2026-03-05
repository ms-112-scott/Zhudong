import React, { useState } from 'react';

const GalleryCard = ({ img, onClick }) => {
  // 追蹤圖片加載狀態
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={onClick}
    >
      {/* 圖片容器 */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
        
        {/* --- Lazy Loader 骨架屏效果 --- */}
        {!isLoaded && (
          <div className="absolute inset-0 z-10 animate-pulse bg-slate-300 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <img 
          src={`https://drive.google.com/thumbnail?id=${img.img_id}&sz=w1000`} 
          alt={img.file_name}
          loading="lazy"
          referrerPolicy="no-referrer"
          // 當圖片下載完成，切換狀態
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onError={(e) => { 
            e.target.src = "https://via.placeholder.com/600x450?text=Image+Not+Found";
            setIsLoaded(true); // 失敗也停止顯示加載動畫
          }}
        />

        {/* 懸浮遮罩 */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            查看大圖
          </span>
        </div>
      </div>

      {/* 內容區 */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors truncate flex-1">
            {img.file_name?.replace(/\.[^/.]+$/, "")}
          </h3>
          {img.node_id && (
            <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border border-blue-100">
              {img.node_id}
            </span>
          )}
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed h-10">
          {img.info || ""}
        </p>
        
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            {img.sheet_source || "Archive"}
          </div>
          <span className="text-blue-500 group-hover:underline">View Details →</span>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;