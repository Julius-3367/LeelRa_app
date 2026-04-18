"use client";

import Image from "next/image";
import { useState } from "react";

interface OwnerAvatarProps {
  className?: string;
  size?: number;
}

export function OwnerAvatar({ className = "", size = 64 }: OwnerAvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback to initials
    return (
      <div 
        className={`rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/50 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="font-bold" style={{ fontSize: size * 0.375 }}>WL</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden ring-2 ring-white/50 shadow-lg ${className}`}>
      <Image
        src="/owner-photo.jpg"
        alt="Wakili Geoffrey Langat"
        width={size}
        height={size}
        className="object-cover"
        priority
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 64px, 64px"
      />
    </div>
  );
}
