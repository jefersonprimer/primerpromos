"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

interface RelatedProductsCarouselProps {
  products: Product[];
}

export default function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 5);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollLimits);
      // Run initially and on window resize
      checkScrollLimits();
      window.addEventListener("resize", checkScrollLimits);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScrollLimits);
      }
      window.removeEventListener("resize", checkScrollLimits);
    };
  }, [products]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.8;
      const target = direction === "left" ? scrollLeft - amount : scrollLeft + amount;
      
      scrollRef.current.scrollTo({
        left: target,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12 relative group/carousel">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Promoções Relacionadas
      </h3>
      
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!showLeftBtn}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 z-10 hidden md:flex p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-md transition-all active:scale-95 ${
            showLeftBtn 
              ? "opacity-0 group-hover/carousel:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer" 
              : "opacity-0 pointer-events-none"
          }`}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Right Arrow */}
        <button
          onClick={() => handleScroll("right")}
          disabled={!showRightBtn}
          className={`absolute -right-6 top-1/2 -translate-y-1/2 z-10 hidden md:flex p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-md transition-all active:scale-95 ${
            showRightBtn 
              ? "opacity-0 group-hover/carousel:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer" 
              : "opacity-0 pointer-events-none"
          }`}
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((p) => (
            <div 
              key={p.id} 
              className="w-[280px] sm:w-[290px] shrink-0 snap-start"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
