'use client';

import { useEffect, useState } from 'react';
import ProductCard, { type Product } from './components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Falha ao carregar promoções.');
        }

        if (!Array.isArray(data)) {
          throw new Error('Resposta inválida da API.');
        }

        setProducts(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setError(err instanceof Error ? err.message : 'Falha ao carregar promoções.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <header className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Promoções do Dia
        </h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            🔥 {products.length} Ofertas encontradas
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 h-96 rounded-lg border border-zinc-200 dark:border-zinc-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">Nenhuma promoção encontrada. O worker está rodando?</p>
          </div>
        )}
      </main>
    </div>
  );
}
