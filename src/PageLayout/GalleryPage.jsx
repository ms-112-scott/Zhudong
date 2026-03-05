import React, { useEffect, useState } from 'react';
import GalleryCard from '../components/GalleryPage/GalleryCard'
import ImageLightbox from '../components/GalleryPage/ImageLightbox';

const GITHUB_JSON_URL = "https://raw.githubusercontent.com/ms-112-scott/Zhudong/master/src/data/images.json";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    fetch(GITHUB_JSON_URL)
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
      {/* Header */}
      <header className="bg-slate-900 text-white py-16 px-6 mb-12 relative overflow-hidden text-left">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            竹東林場 <span className="text-blue-400 text-3xl font-light">數位影像誌</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            透過鏡頭探索工作站的歲月足跡，記錄每一刻珍貴的勞動與景觀記憶。
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm">
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
              共 {images.length} 張珍藏圖片
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-blue-600/10 to-transparent"></div>
      </header>

      {/* Main Grid */}
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

      {/* Lightbox */}
      <ImageLightbox 
        img={selectedImg} 
        onClose={() => setSelectedImg(null)} 
      />
    </div>
  );
}