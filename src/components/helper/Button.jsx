import React from 'react';

// 模擬按鈕元件
export const Button = ({ children, className, variant = 'primary' }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-full font-bold transition-all duration-200 cursor-pointer";
const styles = {
    primary: "bg-main text-fg hover:bg-main-dark hover:shadow-lg active:scale-95",
    outline: "border-2 border-surface-200 text-muted hover:border-text-main hover:text-fg active:scale-95"
  }
  return <button className={`${baseStyle} ${styles[variant]} ${className}`}>{children}</button>;
};
``