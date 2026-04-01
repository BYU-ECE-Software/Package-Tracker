import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' }); // or 'smooth' if you want animation
  }, [pathname]);

  return null;
};

export default ScrollToTop;
