import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // 請確保安裝 lucide-react: npm install lucide-react

// 定義選單項目，方便重複使用
const NAV_ITEMS = [
  { name: '知識圖譜', path: '/KnowledgeGraphPage' },
  // { name: '卡片盒', path: '/Cards' },
  { name: '文化教案', path: '/education' },
  { name: '工作坊', path: '/workshop' },
];

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // [新增] 控制手機選單開關
  const location = useLocation(); // 用來監聽換頁，換頁後自動關閉選單

  // 監聽滾動邏輯
  useEffect(() => {
    const controlNavbar = () => {
      // 如果手機選單是打開的，就不要隱藏 Navbar
      if (isMenuOpen) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 往下滾動：隱藏
        setIsVisible(false);
      } else {
        // 往上滾動：顯示
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isMenuOpen]);

  // 換頁時自動關閉手機選單
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-sm border-b border-surface-200 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          
          {/* 左側 Logo */}
          <div className="cursor-pointer z-50 relative">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-fg hover:opacity-80 transition-opacity">
                農再 <span className="text-main">竹東</span>
              </h1>
            </Link>
          </div>

          {/* --- 1. 桌機版選單 (Desktop Menu) --- */}
          {/* md:flex 表示在中型螢幕以上顯示，手機版隱藏 */}
          <nav className="hidden md:flex items-center gap-16">
            <ul className="flex items-center gap-12 text-lg font-medium text-muted">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="transition-colors hover:text-main"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- 2. 手機版漢堡按鈕 (Mobile Hamburger Button) --- */}
          {/* md:hidden 表示在中型螢幕以上隱藏，只在手機版顯示 */}
          <button 
            className="md:hidden z-50 p-2 text-fg hover:text-main focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* --- 3. 手機版全螢幕選單 (Mobile Menu Overlay) --- */}
        {/* 絕對定位，根據 isMenuOpen 控制滑入/滑出或透明度 */}
        <div 
          className={`fixed inset-0 top-0 left-0 h-screen w-screen bg-[#1e1e23] z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out md:hidden ${
            isMenuOpen 
              ? 'opacity-100 visible translate-y-0' 
              : 'opacity-0 invisible -translate-y-10'
          }`}
        >
          <ul className="flex flex-col items-center gap-8 text-2xl font-medium text-white">
            {NAV_ITEMS.map((item, index) => (
              <li 
                key={item.path}
                // 加入延遲動畫效果，讓選項一個個浮現
                style={{ transitionDelay: `${index * 100}ms` }}
                className={`transition-all duration-500 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <Link 
                  to={item.path} 
                  className="hover:text-[#457B9D] transition-colors"
                  onClick={() => setIsMenuOpen(false)} // 點擊後關閉選單
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>
      
      {/* 遮罩層 (可選)：如果希望背景不能滾動，可以在 isMenuOpen 時給 body 加 overflow-hidden */}
    </>
  );
}

export default Navbar;