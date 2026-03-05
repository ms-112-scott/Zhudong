import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 這是你專屬的 GitHub Raw URL
  const githubJsonUrl = "https://raw.githubusercontent.com/ms-112-scott/Zhudong/master/src/data/images.json";

  useEffect(() => {
    fetch(githubJsonUrl)
      .then(res => {
        if (!res.ok) throw new Error("找不到 JSON 檔案，請確認 GitHub 是否已同步成功");
        return res.json();
      })
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("讀取失敗:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>同步資料中...</div>;
  console.log(images);
  
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