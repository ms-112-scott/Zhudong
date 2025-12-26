import React from 'react';
import { Calendar, MapPin, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const WorkshopPage = () => {
  // 模擬活動資料
  const events = [
    { 
      id: 1, 
      date: "2024.10.15", 
      title: "台北數位藝術節：互動裝置展演", 
      location: "松山文創園區",
      desc: "展示團隊最新的實體互動裝置，結合 D3.js 與投影技術。",
      tags: ["展覽", "實體互動"]
    },
    { 
      id: 2, 
      date: "2024.08.20", 
      title: "歷史資料結構化工作坊", 
      location: "線上會議 (Zoom)",
      desc: "針對研究人員舉辦的資料清理與結構化教學。",
      tags: ["工作坊", "教學"]
    },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e23] text-white pt-24 pb-20 px-4 md:px-12 overflow-y-auto">
      
      {/* 1. 頁面標題 */}
      <div className="max-w-6xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-4 tracking-wider">Workshops & Events</h1>
          <p className="text-white/50 text-lg max-w-xl">
            紀錄我們舉辦的實體工作坊、講座與展覽活動。
          </p>
        </div>
        <div className="flex gap-4">
           <div className="text-center px-6 py-3 bg-white/5 rounded-lg border border-white/10">
              <span className="block text-2xl font-bold text-[#F4A261]">12</span>
              <span className="text-xs text-white/40 uppercase">舉辦場次</span>
           </div>
           <div className="text-center px-6 py-3 bg-white/5 rounded-lg border border-white/10">
              <span className="block text-2xl font-bold text-[#2A9D8F]">350+</span>
              <span className="text-xs text-white/40 uppercase">參與人次</span>
           </div>
        </div>
      </div>

      {/* 2. 照片藝廊 (Masonry Style 模擬) */}
      <div className="max-w-6xl mx-auto mb-20">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/80">
          <ImageIcon size={20} /> 活動集錦
        </h3>
        {/* 這裡使用 Grid 模擬照片牆，您可以替換成真實 <img> */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-125">
          <div className="col-span-2 row-span-2 bg-neutral-800 rounded-2xl overflow-hidden relative group">
             {/* 模擬大圖 */}
             <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
             <span className="absolute bottom-4 left-4 font-bold">2023 年度成果展</span>
          </div>
          <div className="bg-neutral-700 rounded-2xl col-span-1 row-span-1 opacity-80 hover:opacity-100 transition-opacity"></div>
          <div className="bg-neutral-600 rounded-2xl col-span-1 row-span-1 opacity-80 hover:opacity-100 transition-opacity"></div>
          <div className="bg-neutral-700 rounded-2xl col-span-2 row-span-1 opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center text-white/20 font-bold text-xl">
             MORE PHOTOS
          </div>
        </div>
      </div>

      {/* 3. 近期與過去活動列表 */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-white/80 border-b border-white/10 pb-4">
          <Calendar size={20} /> 活動列表
        </h3>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col md:flex-row group bg-white/5 border border-white/5 hover:border-[#457B9D]/50 hover:bg-white/10 rounded-xl transition-all duration-300 p-6 gap-6">
              
              {/* 日期區塊 */}
              <div className="shrink-0 w-24 flex flex-col items-center justify-center border-r border-white/10 pr-6 md:pr-0 md:border-r-0">
                <span className="text-3xl font-bold text-white/90">{event.date.split('.')[2]}</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">{event.date.split('.')[1]} / {event.date.split('.')[0]}</span>
              </div>

              {/* 內容區塊 */}
              <div className="grow border-l border-white/10 pl-0 md:pl-6 md:border-l">
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] bg-white/10 rounded text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
                <h4 className="text-2xl font-bold mb-2 group-hover:text-[#457B9D] transition-colors">
                  {event.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                </div>
                <p className="text-white/70 leading-relaxed max-w-2xl">
                  {event.desc}
                </p>
              </div>

              {/* 按鈕 */}
              <div className="flex items-center justify-end">
                <button className="p-3 rounded-full bg-white/5 group-hover:bg-[#457B9D] transition-colors">
                  <ArrowUpRight size={20} className="text-white/50 group-hover:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WorkshopPage;