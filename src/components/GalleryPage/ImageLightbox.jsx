import React from 'react';

const ImageLightbox = ({ img, onClose }) => {
  if (!img) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 bg-black flex items-center justify-center">
            <img 
              src={`https://drive.google.com/thumbnail?id=${img.img_id}&sz=w1000`}  
              className="max-h-[80vh] object-cover"
              alt="Full view"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="md:w-1/3 p-8 bg-white">
            <span className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2 block text-left">影像詳細資訊</span>
            <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight text-left">
              {img.file_name}
            </h2>
            <div className="space-y-4 text-slate-600 text-left">
              <div className="bg-slate-50 p-4 rounded-xl text-left">
                <p className="text-sm italic leading-relaxed">
                  {img.info || "尚無詳細描述。"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1 font-bold uppercase">節點編號</p>
                  <p className="text-slate-900 text-sm">{img.node_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1 font-bold uppercase">來源分頁</p>
                  <p className="text-slate-900 text-sm">{img.sheet_source || "未分類"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;