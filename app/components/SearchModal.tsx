"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { getCategorySlug, slugify } from "@/app/lib/utils";
import { type Product } from "./ProductCard";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  categoryFilter?: string;
  excludeIds?: number[];
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectProduct,
  categoryFilter = "",
  excludeIds = [],
}: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSearchQuery("");
        setSearchResults([]);
      }, 0);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Debounced API Search
  const excludeIdsString = excludeIds.join(",");
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const catParam = categoryFilter
          ? `&category=${encodeURIComponent(categoryFilter)}`
          : "";
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(searchQuery)}${catParam}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          // Exclude specific IDs (e.g. products already in the comparator)
          const idsToExclude = excludeIdsString.split(",").map(Number);
          const filtered = data.filter((p) => !idsToExclude.includes(p.id));
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categoryFilter, excludeIdsString]);

  if (!isOpen) return null;

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      const categorySlug = product.category
        ? getCategorySlug(product.category)
        : "produto";
      router.push(`/${categorySlug}/${product.id}-${slugify(product.title)}`);
    }
    onClose();
  };

  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr);
    if (isNaN(price)) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Search Field */}
        <div className="flex items-center gap-3 px-5 py-4">
          <Search className="text-zinc-400 dark:text-zinc-500 w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder={
              categoryFilter
                ? `Buscar em ${categoryFilter}s...`
                : "Digite para buscar produtos..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-base w-full placeholder-zinc-400 text-zinc-900 dark:text-zinc-100 py-1"
            autoFocus
          />

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold p-2 rounded-3xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[250px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600 dark:text-blue-500" />
              <span className="text-sm font-semibold">Buscando...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="flex items-center gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl text-left w-full transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                >
                  <div className="w-20 h-20 bg-white rounded-xl border border-zinc-100 flex items-center justify-center p-1 shrink-0 relative overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {product.title}
                    </span>
                    <span className="text-lg text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                      {formatPrice(product.cash_price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-center px-4">
              <span className="text-sm font-bold">
                Nenhum produto com especificações encontrado.
              </span>
              <span className="text-xs mt-1">
                Experimente buscar por outros termos ou verifique a grafia.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Navegação Rápida
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    router.push("/");
                    onClose();
                  }}
                  className="p-3 text-left bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 rounded-2xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  🔥 Promoções do Dia
                </button>
                <button
                  onClick={() => {
                    router.push("/comparador");
                    onClose();
                  }}
                  className="p-3 text-left bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 rounded-2xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  ⚔️ Comparador
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
