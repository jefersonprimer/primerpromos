import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ExternalLink, ShoppingBag, Calendar, Tag } from "lucide-react";
import prisma from "@/app/lib/prisma";
import CopyCouponButton from "@/app/components/CopyCouponButton";
import ProductCard from "@/app/components/ProductCard";
import { slugify } from "@/app/lib/utils";
import PriceHistoryChart from "@/app/components/PriceHistoryChart";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Extract ID from slug (format: ID-slugified-title)
  const match = slug.match(/^(\d+)-/);
  if (!match) {
    notFound();
  }

  const productId = parseInt(match[1], 10);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      price_histories: {
        orderBy: {
          date: "asc"
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Fetch related products (same category or same source, excluding current product)
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      OR: [
        { category: product.category },
        { source_site: product.source_site }
      ]
    },
    take: 4,
    orderBy: {
      created_at: "desc",
    },
  });

  const timeAgo = formatDistanceToNow(new Date(product.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const formattedCashPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(product.cash_price.toString()));

  const formattedInstallmentPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(product.installment_price.toString()));

  const hasCoupon = !!product.coupon;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium"
          >
            <ChevronLeft size={14} />
            <span>Voltar para todas as promoções</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          
          {/* Images Gallery Container */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl flex items-center justify-center p-6 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
              {product.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-zinc-400">Sem imagem</span>
              )}
            </div>

            {/* Gallery Thumbnail Preview list (mocking multi-images if only 1 exists) */}
            <div className="flex gap-2 justify-center">
              <button className="w-16 h-16 rounded-lg border-2 border-blue-500 bg-white flex items-center justify-center p-1 cursor-pointer">
                {product.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image_url} alt="Miniatura 1" className="max-h-full max-w-full object-contain" />
                )}
              </button>
              {/* Extra placeholder thumbnails to simulate gallery */}
              <button className="w-16 h-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                {product.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image_url} alt="Miniatura 2" className="max-h-full max-w-full object-contain filter grayscale" />
                )}
              </button>
            </div>
          </div>

          {/* Details and Information */}
          <div className="md:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              
              {/* Badges / Source and Time */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium capitalize">
                  {product.source_site}
                </span>
                {product.category && (
                  <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <Tag size={12} />
                    {product.category}
                  </span>
                )}
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 ml-auto">
                  <Calendar size={12} />
                  {timeAgo}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                {product.title}
              </h1>

              {/* Pricing details */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/40 flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {formattedCashPrice}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    à vista
                  </span>
                </div>

                {parseFloat(product.installment_price.toString()) > 0 &&
                  product.installments_count > 1 && (
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 flex flex-col gap-0.5 border-t border-zinc-200/60 dark:border-zinc-800/40 pt-2 mt-1">
                      <div>
                        ou em <span className="font-semibold">{product.installments_count}x</span> de{" "}
                        <span className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(
                            parseFloat(product.installment_price.toString()) /
                              product.installments_count,
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Total de {formattedInstallmentPrice} a prazo
                      </div>
                    </div>
                  )}
              </div>

              {/* Coupon Copy Component */}
              {hasCoupon && product.coupon && (
                <CopyCouponButton coupon={product.coupon} />
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href={product.store_url || product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-colors cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 text-center"
              >
                <ShoppingBag size={18} />
                Ir para a Loja ({product.source_site})
              </a>

              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 font-semibold text-xs py-2.5 transition-colors text-center"
              >
                Ver no site original
                <ExternalLink size={12} />
              </a>
            </div>

          </div>
        </div>

        {/* Price History Chart Section */}
        <div className="mt-8">
          <PriceHistoryChart
            history={product.price_histories.map((h) => ({
              id: h.id,
              product_id: h.product_id,
              date: h.date.toISOString(),
              price: parseFloat(h.price.toString()),
              installment_price: parseFloat(h.installment_price.toString()),
            }))}
            currentPrice={parseFloat(product.cash_price.toString())}
          />
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="mt-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Descrição do Produto
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Related Offers Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              Promoções Relacionadas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
