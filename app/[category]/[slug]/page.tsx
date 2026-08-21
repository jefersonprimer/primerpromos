import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, ShoppingBag } from "lucide-react";
import prisma from "@/app/lib/prisma";
import CopyCouponButton from "@/app/components/CopyCouponButton";
import RelatedProductsCarousel from "@/app/components/RelatedProductsCarousel";
import PriceHistoryChart from "@/app/components/PriceHistoryChart";
import ProductImageGallery from "@/app/components/ProductImageGallery";
import ProductComparison from "@/app/components/ProductComparison";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = slug.match(/^(\d+)-/);
  if (!match) return { title: "Produto não encontrado" };

  const productId = parseInt(match[1], 10);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { title: true },
  });

  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.title} | Primer Promos`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { category, slug } = await params;

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
          date: "asc",
        },
      },
      offers: {
        orderBy: {
          cash_price: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products (same category or same source, excluding current product)
  const relatedProductsRaw = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      OR: [
        { category: product.category },
        { source_site: product.source_site },
      ],
    },
    take: 4,
    orderBy: {
      created_at: "desc",
    },
  });

  const relatedProducts = relatedProductsRaw.map((p) => ({
    ...p,
    cash_price: p.cash_price.toString(),
    installment_price: p.installment_price.toString(),
    created_at: p.created_at.toISOString(),
  }));

  // Fetch comparable products in the same category that have specifications
  const comparableProductsRaw = await prisma.product.findMany({
    where: {
      category: product.category,
    },
    select: {
      id: true,
      title: true,
      image_url: true,
      cash_price: true,
      specs: true,
      created_at: true,
    },
  });

  const allComparableProducts = comparableProductsRaw
    .filter((p) => p.specs !== null)
    .map((p) => ({
      ...p,
      cash_price: p.cash_price.toString(),
      created_at: p.created_at.toISOString(),
    }));

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

  // Collect all unique images
  const images: string[] = [];
  if (product.image_url) {
    const trimmed = product.image_url.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          images.push(
            ...parsed.filter(
              (img) => typeof img === "string" && img.trim() !== "",
            ),
          );
        }
      } catch {}
    }
    if (images.length === 0) {
      images.push(
        ...trimmed
          .split(/[,;]+/)
          .map((img) => img.trim())
          .filter((img) => img !== ""),
      );
    }
  }

  // Also collect unique images from offers
  if (product.offers) {
    product.offers.forEach((offer) => {
      if (offer.image_url) {
        const offerImg = offer.image_url.trim();
        if (offerImg && !images.includes(offerImg)) {
          images.push(offerImg);
        }
      }
    });
  }

  const hasCoupon = !!product.coupon;
  const hideThumbnails =
    ["notebooks", "notebook", "smartphones", "smartphone"].includes(
      category.toLowerCase(),
    ) ||
    ["notebooks", "notebook", "smartphones", "smartphone"].includes(
      product.category?.toLowerCase() || "",
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Images Gallery Container */}
          <ProductImageGallery
            images={images}
            title={product.title}
            hideThumbnails={hideThumbnails}
          />

          {/* Details and Information */}
          <div className="md:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              {/* Badges / Source and Time */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium capitalize">
                  {product.source_site}
                </span>

                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 ml-auto">
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
                        ou em{" "}
                        <span className="font-semibold">
                          {product.installments_count}x
                        </span>{" "}
                        de{" "}
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

                {/* Description Section */}
                {product.description && (
                  <div className="mt-8">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      Descrição do Produto
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
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
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 text-center"
              >
                <ShoppingBag size={18} />
                Ir para a Loja {product.source_site}
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

            {/* Outras Ofertas Section */}
            {product.offers && product.offers.length > 0 && (
              <div className="my-6 flex flex-col gap-4">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Outras Lojas e Ofertas
                </h3>
                <div className="flex flex-col gap-3">
                  {product.offers.map((offer) => {
                    const formattedOfferCash = new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(parseFloat(offer.cash_price.toString()));

                    return (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
                      >
                        <Link
                          href={`/${category}/${slug}`}
                          className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
                        >
                          {offer.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={offer.image_url}
                              alt={product.title}
                              className="w-14 h-14 object-contain bg-white rounded-lg p-1 border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                              {offer.store_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 block">
                              {formattedOfferCash}
                            </span>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {offer.installments_count > 1
                                ? `ou ${offer.installments_count}x de ${new Intl.NumberFormat(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    },
                                  ).format(
                                    parseFloat(
                                      offer.installment_price.toString(),
                                    ) / offer.installments_count,
                                  )}`
                                : "Apenas à vista"}
                            </div>
                          </div>
                        </Link>

                        <a
                          href={offer.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl py-2 px-3.5 transition-colors font-semibold text-xs shadow-sm hover:shadow"
                          title={`Ir para ${offer.store_name}`}
                        >
                          <span className="truncate max-w-[80px] sm:max-w-none">
                            {offer.store_name}
                          </span>
                          <ExternalLink size={13} className="shrink-0" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
              installment_price: h.installment_price
                ? parseFloat(h.installment_price.toString())
                : parseFloat(h.price.toString()),
            }))}
            currentPrice={parseFloat(product.cash_price.toString())}
          />
        </div>

        {/* Product Comparison Section */}
        {product.specs && (
          <ProductComparison
            currentProduct={{
              id: product.id,
              title: product.title,
              image_url: product.image_url,
              cash_price: product.cash_price.toString(),
              specs: product.specs,
              category: product.category,
              created_at: product.created_at.toISOString(),
            }}
            allComparableProducts={allComparableProducts}
          />
        )}

        {/* Related Offers Section */}
        {relatedProducts.length > 0 && (
          <RelatedProductsCarousel products={relatedProducts} />
        )}
      </main>
    </div>
  );
}
