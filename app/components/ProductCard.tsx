import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Product {
  id: number;
  source_site: string;
  title: string;
  image_url: string;
  cash_price: string;
  installment_price: string;
  installments_count: number;
  product_url: string;
  created_at: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const timeAgo = formatDistanceToNow(new Date(product.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const formattedCashPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(product.cash_price));

  const formattedInstallmentPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(product.installment_price));

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{timeAgo}</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{product.source_site}</span>
      </div>

      {/* Image */}
      <div className="relative h-48 w-full bg-white flex items-center justify-center p-2">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 gap-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 h-10">
          {product.title}
        </h3>
        
        <div className="flex flex-col gap-1 mt-auto">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {formattedCashPrice}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            à vista no PIX
          </span>
          
          <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
            <span className="font-semibold">{product.installments_count}x</span> de <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(product.installment_price) / product.installments_count)}</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            ou {formattedInstallmentPrice} a prazo
          </div>
        </div>
      </div>

      {/* Action */}
      <a
        href={product.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 mx-4 mb-4 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded transition-colors"
      >
        Ver Promoção
      </a>
    </div>
  );
}
