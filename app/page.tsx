"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard, { type Product } from "./components/ProductCard";
import { getCategorySlug, getCategoryFromSlug } from "@/app/lib/utils";

interface HomeContentProps {
  categoryFromRoute?: string;
}

export function HomeContent({ categoryFromRoute }: HomeContentProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const categoryFromSlug = categoryFromRoute ? getCategoryFromSlug(categoryFromRoute) : null;
  const selectedCategory = categoryFromSlug || searchParams.get("category") || null;

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      const slug = getCategorySlug(category);
      router.push(`/${slug}`);
    } else {
      router.push("/");
    }
  };

  const fetchProducts = useCallback(async (pageToFetch: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const url = new URL("/api/products", window.location.origin);
      url.searchParams.set("page", pageToFetch.toString());
      url.searchParams.set("limit", "20");
      if (selectedCategory) {
        url.searchParams.set("category", selectedCategory);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Falha ao carregar promoções.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida da API.");
      }

      if (isInitial) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }

      if (data.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(
        err instanceof Error ? err.message : "Falha ao carregar promoções.",
      );
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }, 0);
  }, [selectedCategory, fetchProducts]);

  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [page, loading, loadingMore, hasMore, fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-7xl mx-auto p-8">

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          {selectedCategory && `${selectedCategory}s em Destaque`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-zinc-900 h-96 rounded-lg border border-zinc-200 dark:border-zinc-800"
              ></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {loadingMore && [...Array(20)].map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="animate-pulse bg-white dark:bg-zinc-900 h-96 rounded-lg border border-zinc-200 dark:border-zinc-800"
                ></div>
              ))}
            </div>
            
            {/* Element to trigger observer when it enters viewport */}
            <div ref={observerRef} className="h-10 w-full mt-4" />
          </>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              {selectedCategory
                ? `Nenhuma promoção encontrada na categoria ${selectedCategory}.`
                : "Nenhuma promoção encontrada. O worker está rodando?"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
          <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
