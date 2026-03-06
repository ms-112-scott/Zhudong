import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { Loader2, AlertCircle } from 'lucide-react';

const MediaSection = ({ node }) => {
  const { images, loading } = useData();
  const scrollRef = useRef(null);
  const requestRef = useRef(null);
  const scrollSpeed = useRef(0);

  // 1. 根據 node.id 過濾
  const nodeImages = useMemo(() => {
    if (!images || !node) return [];
    return images.filter((img) => String(img.node_id) === String(node.id));
  }, [images, node]);

  // 2. 自動捲動核心邏輯
  const animate = () => {
    if (scrollRef.current && scrollSpeed.current !== 0) {
      scrollRef.current.scrollLeft += scrollSpeed.current;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // 滑鼠在容器內的相對 X 座標
    const edgeSize = 80; // 感應區寬度 (px)
    const maxSpeed = 3; // 最大捲動速度

    if (x < edgeSize && x > 0) {
      // 靠近左側：速度為負
      const intensity = (edgeSize - x) / edgeSize;
      scrollSpeed.current = -intensity * maxSpeed;
    } else if (x > rect.width - edgeSize && x < rect.width) {
      // 靠近右側：速度為正
      const intensity = (x - (rect.width - edgeSize)) / edgeSize;
      scrollSpeed.current = intensity * maxSpeed;
    } else {
      scrollSpeed.current = 0;
    }
  };

  const handleMouseLeave = () => {
    scrollSpeed.current = 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-28 bg-white/3 rounded-2xl border border-white/5 animate-pulse">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    );
  }

  if (nodeImages.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Archive Media</h3>
        <div className="flex items-center gap-2">
           <div className="h-px w-4 bg-white/10" />
           <span className="text-[10px] font-mono text-blue-400/50">{nodeImages.length} items</span>
        </div>
      </div>

      {/* 捲動容器 */}
      <div className="relative group/container">
        <div 
          ref={scrollRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex gap-3 overflow-x-auto pb-4 px-1 custom-scrollbar-minimal no-scrollbar"
        >
          {nodeImages.map((img, idx) => (
            <ImageItem key={img.id || idx} img={img} />
          ))}
        </div>

        {/* 視覺裝飾：兩側漸層感應提示 (可選，增加質感) */}
        <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-[#1e1e22] to-transparent pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#1e1e22] to-transparent pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity duration-500" />
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-minimal::-webkit-scrollbar {
          height: 3px;
        }
        .custom-scrollbar-minimal::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar-minimal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const ImageItem = ({ img }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="shrink-0 group relative overflow-hidden rounded-xl bg-white/3 border border-white/5 hover:border-blue-500/40 transition-all duration-500 cursor-zoom-in"
      style={{ width: '200px', height: '300px' }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
           <Loader2 className="w-4 h-4 text-white/10 animate-spin" />
        </div>
      )}

      {!hasError ? (
        <img 
          src={`https://drive.google.com/thumbnail?id=${img.img_id}&sz=w1000`} 
          alt={img.file_name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isLoaded ? 'opacity-60 group-hover:opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/10 p-2 text-center">
          <AlertCircle className="w-4 h-4 text-red-500/40 mb-1" />
          <span className="text-[8px] text-red-500/40 leading-tight">Image restricted</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
        <span className="text-[9px] text-white/90 truncate w-full font-medium tracking-tight translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {img.title || img.file_name || 'Untitled Document'}
        </span>
      </div>
    </div>
  );
};

export default MediaSection;