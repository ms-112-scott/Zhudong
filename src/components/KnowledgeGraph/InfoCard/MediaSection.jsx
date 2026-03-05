import React from 'react';
import { Play, FileText } from 'lucide-react';

const MediaSection = ({ node }) => (
  <div className="relative w-full aspect-video bg-black/40 shrink-0 border-t border-white/10 mt-auto">
    {node.mediaType === 'video' ? (
      <div className="w-full h-full flex items-center justify-center group cursor-pointer">
        <img src={node.img || "/api/placeholder/400/320"} alt="video cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all">
            <Play fill="white" className="ml-1" size={32} />
          </div>
        </div>
      </div>
    ) : node.mediaType === 'image' ? (
      <img src={node.img || "/api/placeholder/400/320"} alt={node.id} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
        <FileText size={40} />
        <span className="text-xs mt-2 uppercase tracking-tighter font-bold">No Media Available</span>
      </div>
    )}
  </div>
);

export default MediaSection;