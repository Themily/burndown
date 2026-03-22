import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimating(false);
      }, 50);
      prevRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${animating ? 'opacity-60 translate-y-0.5' : 'opacity-100 translate-y-0'} ${className}`}
    >
      {displayValue}
    </span>
  );
}
