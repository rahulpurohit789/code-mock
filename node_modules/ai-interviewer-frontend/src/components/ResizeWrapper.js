import React, { useEffect, useRef } from 'react';

const ResizeWrapper = ({ children }) => {
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Create a ResizeObserver instance
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to throttle updates
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
      });
    });

    // Observe the wrapper element
    resizeObserver.observe(wrapperRef.current);

    // Cleanup
    return () => {
      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="resize-wrapper" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

export default ResizeWrapper; 