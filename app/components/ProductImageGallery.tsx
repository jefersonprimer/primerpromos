"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  hideThumbnails?: boolean;
}

export default function ProductImageGallery({ images, title, hideThumbnails = false }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling when open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-white dark:bg-zinc-950 rounded-3xl flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <span className="text-zinc-400">Sem imagem</span>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const hasMultipleImages = images.length > 1;

  return (
    <div className="md:col-span-6 md:sticky md:top-24 self-start flex flex-col gap-4">
      {/* Main Image Viewer */}
      <div 
        onDoubleClick={() => setIsLightboxOpen(true)}
        className="relative aspect-square w-full bg-white rounded-3xl flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm group cursor-zoom-in"
        title="Double click para ampliar"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={`${title} - Imagem ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300 p-4 pb-12"
        />

        {/* Navigation Controls and Indicator Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 py-1.5 px-3 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-md border border-zinc-200/60 dark:border-zinc-800/60 z-10">
            {/* Arrow Left */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="p-1 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2 items-center">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    index === currentIndex
                      ? "bg-blue-500 w-4"
                      : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                  }`}
                  aria-label={`Ir para imagem ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrow Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-1 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Gallery Thumbnail Preview list */}
      {hasMultipleImages && !hideThumbnails && (
        <div className="flex gap-2 justify-center flex-wrap">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg border-2 bg-white flex items-center justify-center p-1 cursor-pointer transition-all ${
                index === currentIndex
                  ? "border-blue-500"
                  : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Miniatura ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 backdrop-blur-sm flex flex-col justify-center items-center select-none"
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute top-6 right-6 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-all cursor-pointer shadow-sm hover:shadow"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>

          {/* Lightbox Content Container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl px-4 flex flex-col items-center gap-6"
          >
            {/* Main Lightbox Image */}
            <div className="relative w-full aspect-[4/3] max-h-[75vh] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex]}
                alt={`${title} - Visualização cheia`}
                className="max-h-full max-w-full object-contain p-2"
              />

              {/* Overlay Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-md"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-md"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Dots Indicator for Lightbox */}
            {hasMultipleImages && (
              <div className="flex gap-2.5 items-center bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                      index === currentIndex
                        ? "bg-blue-500 w-6"
                        : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
