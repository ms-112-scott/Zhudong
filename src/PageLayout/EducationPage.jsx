import React, { useState } from 'react';
import { Play, BookOpen, Clock, ChevronRight } from 'lucide-react';

const EducationPage = () => {
  // 模擬資料
  const courses = [
    { id: 1, title: "數位人文導論", category: "基礎課程", duration: "45 min", image: "bg-blue-900" },
    { id: 2, title: "社會網絡分析實戰", category: "進階技術", duration: "60 min", image: "bg-emerald-900" },
    { id: 3, title: "歷史資料視覺化", category: "設計應用", duration: "30 min", image: "bg-purple-900" },
    { id: 4, title: "檔案解讀與編碼", category: "研究方法", duration: "50 min", image: "bg-orange-900" },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e23] text-white pt-24 pb-20 px-4 md:px-12 overflow-y-auto">
      
      {/* 1. 頁面標題 */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 tracking-wider">Education & Resources</h1>
        <p className="text-white/50 text-lg max-w-2xl">
          探索數位人文的研究方法與案例分析，透過影音與文獻深入了解知識圖譜的建構過程。
        </p>
      </div>

      {/* 2. 主打影音區 (Featured Video) */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="relative w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
          {/* 模擬影片封面 */}
          <div className="absolute inset-0 bg-linear-to-t from-[#1e1e23] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-500">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
              <Play className="ml-1 fill-white" size={32} />
            </div>
          </div>
          
          {/* 實際使用時，這裡可以放 <iframe src="..." /> */}
          <div className="absolute bottom-8 left-8 z-20">
            <span className="px-3 py-1 bg-[#E63946] text-xs font-bold rounded-full mb-2 inline-block">FEATURED</span>
            <h2 className="text-3xl font-bold mb-2">如何解讀非結構化歷史文本？</h2>
            <p className="text-white/70">本集邀請到專案主持人，講解 NLP 技術在史料處理中的應用。</p>
          </div>
        </div>
      </div>

      {/* 3. 課程/文章列表 (Grid Layout) */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-[#457B9D]" />
            最新課程
          </h3>
          <button className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors">
            查看全部 <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              {/* 縮圖區域 */}
              <div className={`h-40 w-full ${course.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
              </div>
              
              {/* 內容區域 */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-[#457B9D] font-medium px-2 py-1 bg-[#457B9D]/10 rounded">
                    {course.category}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock size={12} /> {course.duration}
                  </span>
                </div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-[#457B9D] transition-colors">
                  {course.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EducationPage;