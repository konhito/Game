"use client";

import Image from "next/image";
import { useState } from "react";

interface NewsImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function NewsImage({ src, alt, className = "", width = 400, height = 300 }: NewsImageProps) {
  const [error, setError] = useState(false);
  
  // Default fallback image
  const fallbackImage = "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png";
  
  // If no source or error occurred, use fallback
  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center ${className}`}>
        <Image
          src={fallbackImage}
          alt={alt}
          width={width}
          height={height}
          className="object-contain opacity-50"
          unoptimized
        />
      </div>
    );
  }

  // Construct full URL if it's a relative path
  const imageUrl = src.startsWith('http') 
    ? src 
    : `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}${src}`;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      unoptimized={!src.includes('vercel-storage.com')} // Only optimize Vercel images
    />
  );
}

