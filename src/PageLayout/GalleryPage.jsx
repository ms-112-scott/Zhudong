import React, { useState } from 'react';
import { useData } from '../context/DataContext'; // 引入 Hook
import GalleryCard from '../components/GalleryPage/GalleryCard';
import ImageLightbox from '../components/GalleryPage/ImageLightbox';

export default function GalleryPage() {
  const { images, loading } = useData(); // 直接取得全域資料
  const [selectedImg, setSelectedImg] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">正在調度歷史影像...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-slate-900 text-white py-16 px-6 mb-12 text-left">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            竹東林場 <span className="text-blue-400 text-3xl font-light">數位影像誌</span>
          </h1>
          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 text-sm">
             共 {images.length} 張珍藏圖片
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {images.map((img, index) => (
            <GalleryCard 
              key={img.img_id || index} 
              img={img} 
              onClick={() => setSelectedImg(img)} 
            />
          ))}
        </div>
      </main>

      <ImageLightbox img={selectedImg} onClose={() => setSelectedImg(null)} />
    </div>
  );
}