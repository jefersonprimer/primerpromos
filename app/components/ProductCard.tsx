import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { slugify } from "@/app/lib/utils";

export interface Product {
  id: number;
  source_site: string;
  title: string;
  category?: string | null;
  description?: string | null;
  image_url: string;
  cash_price: string;
  installment_price: string;
  installments_count: number;
  coupon?: string | null;
  product_url: string;
  store_url?: string | null;
  created_at: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const timeAgo = formatDistanceToNow(new Date(product.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const formattedCashPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(product.cash_price));

  const formattedInstallmentPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(product.installment_price));

  const hasCoupon = !!product.coupon;

  return (
    <Link
      href={`/produto/${product.id}-${slugify(product.title)}`}
      className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative cursor-pointer group"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex gap-1.5 items-center">
          <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">
            {product.source_site}
          </span>
        </div>

        <span>{timeAgo}</span>
      </div>

      {/* Image */}
      <div className="relative h-48 w-full bg-white flex items-center justify-center p-4">
        {product.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image_url}
            alt={product.title}
            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            No Image
          </div>
        )}

        {hasCoupon && (
          <div className="absolute top-2 right-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Cupom: {product.coupon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 gap-2 flex-grow">
        <h3 className="text-sm font-normal text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.title}
        </h3>

        <div className="flex flex-col gap-1 mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {formattedCashPrice}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              à vista
            </span>
          </div>

          {parseFloat(product.installment_price) > 0 &&
            product.installments_count > 1 && (
              <>
                <div className="text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">
                    {product.installments_count}x
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      parseFloat(product.installment_price) /
                        product.installments_count,
                    )}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  ou {formattedInstallmentPrice} a prazo
                </div>
              </>
            )}
        </div>
      </div>
    </Link>
  );
}
