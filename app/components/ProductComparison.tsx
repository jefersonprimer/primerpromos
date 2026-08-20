"use client";

import { useState, Fragment, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductComparisonProps {
  currentProduct: {
    id: number;
    title: string;
    image_url: string;
    cash_price: string;
    specs: any;
    category: string | null;
    created_at: string;
  };
  allComparableProducts: {
    id: number;
    title: string;
    image_url: string;
    cash_price: string;
    specs: any;
    created_at: string;
  }[];
}

export default function ProductComparison({
  currentProduct,
  allComparableProducts,
}: ProductComparisonProps) {
  // Helper to extract a value from the product specs JSON
  const getSpecString = (
    specs: any,
    groupName: string,
    attrName: string,
  ): string => {
    if (!specs || !Array.isArray(specs)) return "";
    const group = specs.find((g: any) => g.group === groupName);
    if (!group || !Array.isArray(group.values)) return "";
    const attr = group.values.find((v: any) => v.name === attrName);
    if (!attr || !Array.isArray(attr.values) || attr.values.length === 0)
      return "";
    return attr.values.join(", ");
  };

  // State to toggle groups visibility (accordion)
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getSpecValue = (
    specs: any,
    groupName: string,
    attrName: string,
  ): string => {
    if (!specs || !Array.isArray(specs)) return "-";
    const group = specs.find((g: any) => g.group === groupName);
    if (!group || !Array.isArray(group.values)) return "-";
    const attr = group.values.find((v: any) => v.name === attrName);
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

  // Find fixed compared products based on same brand, line, series, and title similarity
  const sortedComparisonGroup = useMemo(() => {
    const currentBrand = getSpecString(
      currentProduct.specs,
      "Informações Básicas",
      "Marca",
    ).toLowerCase();
    const currentLine = getSpecString(
      currentProduct.specs,
      "Informações Básicas",
      "Linha",
    ).toLowerCase();
    const currentSeries = getSpecString(
      currentProduct.specs,
      "Informações Básicas",
      "Série",
    ).toLowerCase();

    const rankedOtherProducts = [...allComparableProducts]
      .filter((p) => p.id !== currentProduct.id)
      .map((p) => {
        const pBrand = getSpecString(
          p.specs,
          "Informações Básicas",
          "Marca",
        ).toLowerCase();
        const pLine = getSpecString(
          p.specs,
          "Informações Básicas",
          "Linha",
        ).toLowerCase();
        const pSeries = getSpecString(
          p.specs,
          "Informações Básicas",
          "Série",
        ).toLowerCase();

        let score = 0;
        if (pBrand && pBrand === currentBrand) score += 10;
        if (pLine && pLine === currentLine) score += 5;
        if (pSeries && pSeries === currentSeries) score += 3;

        // Title words match
        const currentWords = currentProduct.title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2);
        const pWords = p.title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2);
        const commonWords = currentWords.filter((w) => pWords.includes(w));
        score += commonWords.length;

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.product);

    // Take top 2
    const topComparable = rankedOtherProducts.slice(0, 2);

    // Group and sort chronologically/progression by Launch Year and Product Tier
    return [currentProduct, ...topComparable].sort((a, b) => {
      const yearA =
        parseInt(
          getSpecString(a.specs, "Informações Básicas", "Ano de Lançamento"),
        ) || 0;
      const yearB =
        parseInt(
          getSpecString(b.specs, "Informações Básicas", "Ano de Lançamento"),
        ) || 0;

      if (yearA !== yearB && yearA > 0 && yearB > 0) {
        return yearA - yearB;
      }

      const getTierRank = (title: string) => {
        const lower = title.toLowerCase();
        if (lower.includes("ultra") || lower.includes("pro max")) return 4;
        if (lower.includes("pro") || lower.includes("max")) return 3;
        if (
          lower.includes("plus") ||
          lower.includes("lite") ||
          lower.includes("+")
        )
          return 2;
        return 1;
      };

      const rankA = getTierRank(a.title);
      const rankB = getTierRank(b.title);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const timeDiff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.title.localeCompare(b.title);
    });
  }, [currentProduct, allComparableProducts]);

  const currentSpecs = currentProduct.specs;
  if (
    !currentSpecs ||
    !Array.isArray(currentSpecs) ||
    currentSpecs.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-12 bg-white dark:bg-zinc-900 p-6 rounded-3xl">
      <div className="flex items-center justify-center gap-2 mb-6 pb-4">
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Qual {currentProduct.category} é o certo para você?
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse table-fixed">
          <thead>
            {/* Headers row (Images and Titles) */}
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {sortedComparisonGroup.map((p) => {
                const isCurrent = p.id === currentProduct.id;
                return (
                  <th
                    key={p.id}
                    className="pb-4 px-3 text-center align-top relative"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-48 h-48 object-contain bg-white rounded-2xl"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      )}
                      <span
                        className={`text-base font-semibold block line-clamp-2 max-w-[200px] ${isCurrent ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-900 dark:text-zinc-100"}`}
                      >
                        {p.title}
                      </span>
                      <span className="text-xs font-normal text-zinc-900 dark:text-zinc-50 mt-1">
                        {formatPrice(p.cash_price)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {currentSpecs.map((groupObj: any) => {
              const groupName = groupObj.group;
              const valuesArray = groupObj.values || [];
              const isCollapsed = collapsedGroups[groupName];

              return (
                <Fragment key={groupName}>
                  {/* Accordion Group Header Row */}
                  <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800">
                    <td
                      colSpan={sortedComparisonGroup.length}
                      className="py-2.5 px-3 align-middle font-bold text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="flex items-center gap-1.5 w-full text-left font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                    valuesArray.map((attrObj: any) => {
                      const attrName = attrObj.name;
                      return (
                        <Fragment key={attrName}>
                          {/* Attribute Name Header Row */}
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/20">
                            <td
                              colSpan={sortedComparisonGroup.length}
                              className="py-1 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center border-b border-zinc-100/50 dark:border-zinc-800/20"
                            >
                              {attrName}
                            </td>
                          </tr>
                          {/* Value Cells Row */}
                          <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                            {sortedComparisonGroup.map((p) => {
                              const val = getSpecValue(
                                p.specs,
                                groupName,
                                attrName,
                              );
                              const isCurrent = p.id === currentProduct.id;
                              return (
                                <td
                                  key={p.id}
                                  className={`py-3 px-3 text-sm text-center align-middle ${
                                    isCurrent
                                      ? "font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/5 dark:bg-blue-950/10"
                                      : "text-zinc-700 dark:text-zinc-300"
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        </Fragment>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
