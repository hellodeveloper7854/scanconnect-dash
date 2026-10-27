import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';

/** Blog cover image with alt text and a graceful branded fallback if the image is missing or fails to load. */
export const BlogCover: React.FC<{ src?: string; title: string; className?: string }> = ({ src, title, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={title}
      className={`w-full bg-gradient-to-br from-[#1B1C1C] to-[#3a3b3b] flex flex-col items-center justify-center gap-2 px-4 text-center ${className}`}
    >
      <Newspaper className="w-8 h-8 text-[#FFED00]" aria-hidden="true" />
      <span className="text-white/80 text-xs font-semibold line-clamp-2">Scan Connect</span>
    </div>
  );
};
