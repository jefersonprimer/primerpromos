'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard, { type Product } from '../components/ProductCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory] = useState<string | null>(null);

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

  const filteredProducts = products.filter((product) => {
    const matchesQuery = query
      ? product.title.toLowerCase().includes(query.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
        product.source_site.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          {query ? `Resultados para "${query}"` : 'Busca'} 
          {selectedCategory && ` em ${selectedCategory}s`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 h-96 rounded-lg border border-zinc-200 dark:border-zinc-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            {error}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              Nenhuma promoção encontrada para a sua busca.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
