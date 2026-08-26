"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import { getCategorySlug, slugify } from "@/app/lib/utils";
import SearchModal from "@/app/components/SearchModal";
import { type Product } from "../components/ProductCard";
import { type SpecGroup, type SpecItem } from "../components/ProductComparison";

interface ComparadorClientProps {
  initialProducts: Product[];
  availableCategories: string[];
}

export default function ComparadorClient({
  initialProducts,
  availableCategories,
}: ComparadorClientProps) {
  const router = useRouter();
  const params = useParams();
  const currentSlug = params?.slug as string | undefined;

  const [selectedProducts, setSelectedProducts] =
    useState<Product[]>(initialProducts);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // Update selected products when initialProducts changes
  useEffect(() => {
    if (initialProducts.length > 0) {
      const initialIds = initialProducts.map((p) => p.id).join(",");
      const selectedIds = selectedProducts.map((p) => p.id).join(",");
      if (initialIds !== selectedIds) {
        setSelectedProducts(initialProducts);
      }
    }
  }, [initialProducts, selectedProducts]);

  // Update URL parameters when selection changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const slugParts = selectedProducts.map(
        (p) => slugify(p.title),
      );
      const slug = slugParts.join("-vs-");
      if (currentSlug !== slug) {
        router.replace(`/comparador/${slug}`, { scroll: false });
      }
    } else {
      if (currentSlug) {
        router.replace("/comparador", { scroll: false });
      }
    }
  }, [selectedProducts, router, currentSlug]);

  const handleAddProduct = (product: Product, slotIndex: number) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next[slotIndex] = product;
      return next.filter(Boolean); // compact array
    });
    setActiveSlot(null);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getSpecValue = (
    specs: SpecGroup[] | null | unknown,
    groupName: string,
    attrName: string,
  ): string => {
    if (!specs || !Array.isArray(specs)) return "-";
    const group = (specs as SpecGroup[]).find((g: SpecGroup) => g.group === groupName);
    if (!group || !Array.isArray(group.values)) return "-";
    const attr = group.values.find((v: SpecItem) => v.name === attrName);
    if (!attr || !Array.isArray(attr.values) || attr.values.length === 0)
      return "-";
    return attr.values.join(", ");
  };

  const formatPrice = (priceStr: string) => {
    const price = parseFloat(priceStr);
    if (isNaN(price)) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Consolidate all specs
  const consolidatedSpecs = useMemo(() => {
    const groupsMap = new Map<string, Set<string>>();

    selectedProducts.forEach((product) => {
      const specs = product.specs;
      if (specs && Array.isArray(specs)) {
        (specs as SpecGroup[]).forEach((g: SpecGroup) => {
          if (!groupsMap.has(g.group)) {
            groupsMap.set(g.group, new Set());
          }
          if (g.values && Array.isArray(g.values)) {
            g.values.forEach((v: SpecItem) => {
              groupsMap.get(g.group)!.add(v.name);
            });
          }
        });
      }
    });

    const result: { group: string; attributes: string[] }[] = [];
    groupsMap.forEach((attrs, groupName) => {
      result.push({
        group: groupName,
        attributes: Array.from(attrs),
      });
    });

    return result;
  }, [selectedProducts]);

  // Maximum number of items in comparison
  const maxSlots = 3;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4  pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center justify-center md:justify-start gap-3">
            Comparador de Produtos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Compare smartphones, notebooks e outros dispositivos lado a lado
            para tomar a melhor decisão.
          </p>
        </div>

        {/* Categories Quick Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
              selectedCategory === ""
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
            }`}
          >
            Todos
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {Array.from({ length: maxSlots }).map((_, idx) => {
          const product = selectedProducts[idx];

          if (product) {
            const categorySlug = product.category
              ? getCategorySlug(product.category)
              : "produto";
            const productHref = `/${categorySlug}/${slugify(product.title)}`;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between items-center relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveProduct(idx)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remover produto"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center gap-4 text-center w-full mt-2">
                  <div className="w-40 h-40 bg-white rounded-2xl p-2 flex items-center justify-center border border-zinc-100 dark:border-zinc-800/40">
                    {product.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </>
                    ) : (
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                        Sem Foto
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 px-2 w-full">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[40px] mt-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Link href={productHref}>{product.title}</Link>
                    </h3>
                  </div>
                </div>

                <div className="w-full border-t border-zinc-100 dark:border-zinc-800/60 mt-4 pt-4 flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-zinc-400 font-bold uppercase">
                      À Vista
                    </span>
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                      {formatPrice(product.cash_price)}
                    </span>
                  </div>

                  <a
                    href={product.store_url || product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors"
                  >
                    Ir para Loja
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          }

          return (
            <div
              key={`empty-${idx}`}
              className="bg-zinc-50 dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[280px] transition-all relative"
            >
              <button
                onClick={() => {
                  setActiveSlot(idx);
                }}
                className="flex flex-col items-center gap-3 text-zinc-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 group transition-colors w-full h-full justify-center absolute inset-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 group-hover:border-blue-500 flex items-center justify-center transition-all bg-white dark:bg-zinc-950">
                  <Plus
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Adicionar Produto
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onSelectProduct={(p) => handleAddProduct(p, activeSlot!)}
        categoryFilter={selectedCategory}
        excludeIds={selectedProducts.map((p) => p.id)}
      />

      {/* Comparison Details Table */}
      {selectedProducts.length > 0 ? (
        <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Tabela Comparativa de Especificações
            </h2>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px] border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="py-3 text-left font-bold text-xs text-zinc-400 uppercase tracking-wider w-1/4">
                    Especificação
                  </th>
                  {selectedProducts.map((p) => (
                    <th
                      key={p.id}
                      className="py-3 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 px-3 w-[25%] truncate"
                    >
                      {p.title}
                    </th>
                  ))}
                  {/* Fill empty columns if less than 3 selected */}
                  {Array.from({
                    length: Math.max(0, maxSlots - selectedProducts.length),
                  }).map((_, i) => (
                    <th key={`empty-th-${i}`} className="py-3 w-[25%]" />
                  ))}
                </tr>
              </thead>
              <tbody>
                {consolidatedSpecs.map((groupObj) => {
                  const groupName = groupObj.group;
                  const attributes = groupObj.attributes;
                  const isCollapsed = collapsedGroups[groupName];

                  return (
                    <Fragment key={groupName}>
                      {/* Accordion Group Header Row */}
                      <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800">
                        <td
                          colSpan={maxSlots + 1}
                          className="py-2.5 px-3 align-middle"
                        >
                          <button
                            onClick={() => toggleGroup(groupName)}
                            className="flex items-center gap-1.5 w-full text-left font-bold text-sm text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {isCollapsed ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronUp size={16} />
                            )}
                            {groupName}
                          </button>
                        </td>
                      </tr>

                      {/* Attributes details (if not collapsed) */}
                      {!isCollapsed &&
                        attributes.map((attrName) => (
                          <tr
                            key={attrName}
                            className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                          >
                            <td className="py-3 px-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 capitalize">
                              {attrName}
                            </td>
                            {selectedProducts.map((p) => {
                              const val = getSpecValue(
                                p.specs,
                                groupName,
                                attrName,
                              );
                              return (
                                <td
                                  key={p.id}
                                  className="py-3 px-3 text-xs text-center text-zinc-700 dark:text-zinc-300 align-middle"
                                >
                                  {val}
                                </td>
                              );
                            })}
                            {/* Fill empty cells */}
                            {Array.from({
                              length: Math.max(
                                0,
                                maxSlots - selectedProducts.length,
                              ),
                            }).map((_, i) => (
                              <td key={`empty-td-${i}`} className="py-3" />
                            ))}
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/10 border-2 border-dashed border-zinc-250 dark:border-zinc-800 rounded-3xl gap-4">
          <ArrowLeftRight className="text-zinc-300 dark:text-zinc-700 w-16 h-16 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              Seu comparador está vazio
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
              Adicione produtos nos slots acima para comparar preços e
              especificações detalhadas lado a lado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
