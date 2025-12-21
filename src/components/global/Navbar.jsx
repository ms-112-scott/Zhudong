import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      // 獲取目前的滾動高度
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 往下滾動且超過 100px：隱藏
        setIsVisible(false);
      } else {
        // 往上滾動：顯示
        setIsVisible(true);
      }
      
      // 更新最後一次的滾動位置
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);

    // 清除監聽器
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-surface/95 px-10 py-4 shadow-md backdrop-blur-sm border-b border-surface-200 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* 左側 Logo */}
      <div className="cursor-pointer">
        <Link to="/">
          <h1 className="text-3xl font-bold tracking-wide text-fg hover:opacity-80 transition-opacity">
            農再 <span className="text-main">竹東</span>
          </h1>
        </Link>
      </div>

      {/* 右側選單 */}
      <nav className="flex items-center gap-16">
        <ul className="flex items-center gap-16 pr-16 text-lg font-medium text-muted">
          <li>
            <Link to="/KnowledgeGraphPage" className="transition-colors hover:text-main">
              知識圖譜
            </Link>
          </li>
          <li>
            <Link to="/Cards" className="transition-colors hover:text-main">
              卡片盒
            </Link>
          </li>
          <li>
            <Link to="/education" className="transition-colors hover:text-main">
              文化教案
            </Link>
          </li>
          <li>
            <Link to="/workshop" className="transition-colors hover:text-main">
              工作坊
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar