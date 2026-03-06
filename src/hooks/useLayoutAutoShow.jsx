import { useEffect } from 'react';

export const useLayoutAutoShow = (isDisabled) => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDisabled) {
        document.body.classList.remove('hide-layout');
        return;
      }
      if (e.clientY < 60) document.body.classList.remove('hide-layout');
      else document.body.classList.add('hide-layout');
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.body.classList.remove('hide-layout');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDisabled]);
};