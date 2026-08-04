import React, { useState, useEffect, useRef, Suspense } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  height?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({ children, height = '400px' }) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { rootMargin: '200px' } // Load components 200px before they appear
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isIntersecting ? 'auto' : height }}>
      {isIntersecting ? (
        <Suspense fallback={<div className="w-full" style={{ height }} />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  );
};
