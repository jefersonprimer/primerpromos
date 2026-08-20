"use client";

import { useState, useMemo } from "react";
import ProductCard, { type Product } from "../components/ProductCard";
import { getNormalizedSpec } from "../lib/utils";
import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, X } from "lucide-react";

interface CategoryPageContentProps {
  categoryName: string;
  initialProducts: Product[];
}

interface SpecFilterConfig {
  key: string;
  label: string;
}

const FILTER_CONFIGS: SpecFilterConfig[] = [
  { key: "fabricante", label: "Fabricante" },
  { key: "processador", label: "Processador" },
  { key: "placaVideo", label: "Placa de Vídeo" },
  { key: "resolucao", label: "Resolução" },
  { key: "taxaAtualizacao", label: "Taxa de Atualização" },
  { key: "gamaCores", label: "Gama de Cores" },
  { key: "painel", label: "Painel" },
  { key: "tamanho", label: "Tamanho" },
  { key: "ram", label: "RAM" },
  { key: "armazenamento", label: "Armazenamento" },
  { key: "sistemaOperacional", label: "Sistema Operacional" },
];

export default function CategoryPageContent({
  categoryName,
  initialProducts,
}: CategoryPageContentProps) {
  // Toggle filter panel visibility
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Price range filters
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Sorting state
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");

  const { absoluteMinPrice, absoluteMaxPrice } = useMemo(() => {
    const prices = initialProducts.map((p) => parseFloat(p.cash_price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return { absoluteMinPrice: 0, absoluteMaxPrice: 10000 };
    return {
      absoluteMinPrice: Math.floor(Math.min(...prices)),
      absoluteMaxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [initialProducts]);

  // Selected specs filters: { [filterKey]: Set of selected values }
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({
    fabricante: [],
    processador: [],
    placaVideo: [],
    resolucao: [],
    taxaAtualizacao: [],
    gamaCores: [],
    painel: [],
    tamanho: [],
    ram: [],
    armazenamento: [],
    sistemaOperacional: [],
  });

  // Extract all available values and counts for each spec filter dynamically
  const filterOptions = useMemo(() => {
    const options: Record<string, Record<string, number>> = {};
    
    FILTER_CONFIGS.forEach((config) => {
      options[config.key] = {};
    });

    initialProducts.forEach((product) => {
      FILTER_CONFIGS.forEach((config) => {
        if (product.category && product.category.toLowerCase() === categoryName.toLowerCase() || !categoryName) {
          const val = product.specs ? getNormalizedSpec(product.specs, config.key) : null;
          if (val) {
            const subValues = val.split(",").map((s) => s.trim()).filter(Boolean);
            subValues.forEach((v) => {
              options[config.key][v] = (options[config.key][v] || 0) + 1;
            });
          }
        }
      });
    });

    const sortedOptions: Record<string, { value: string; count: number }[]> = {};
    FILTER_CONFIGS.forEach((config) => {
      sortedOptions[config.key] = Object.entries(options[config.key])
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    });

    return sortedOptions;
  }, [initialProducts, categoryName]);

  // Toggle spec filter checkbox
  const handleCheckboxChange = (key: string, value: string) => {
    setSelectedSpecs((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  // Remove a single filter option
  const handleRemoveFilter = (key: string, value: string) => {
    setSelectedSpecs((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v) => v !== value),
    }));
  };

  // Clear all filters
  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedSpecs({
      fabricante: [],
      processador: [],
      placaVideo: [],
      resolucao: [],
      taxaAtualizacao: [],
      gamaCores: [],
      painel: [],
      tamanho: [],
      ram: [],
      armazenamento: [],
      sistemaOperacional: [],
    });
  };

  // Filter products based on selected specs and price range
  const filteredProducts = useMemo(() => {
    const filtered = initialProducts.filter((product) => {
      // 1. Price filter
      const price = parseFloat(product.cash_price);
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;

      // 2. Specifications filter
      for (const config of FILTER_CONFIGS) {
        const selected = selectedSpecs[config.key];
        if (selected && selected.length > 0) {
          const specVal = product.specs ? getNormalizedSpec(product.specs, config.key) : null;
          if (!specVal) return false;

          const productValues = specVal.split(",").map((s) => s.trim().toLowerCase());
          const hasMatch = selected.some((sel) => productValues.includes(sel.toLowerCase()));
          if (!hasMatch) return false;
        }
      }

      return true;
    });

    if (sortBy === "price_asc") {
      filtered.sort((a, b) => parseFloat(a.cash_price) - parseFloat(b.cash_price));
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => parseFloat(b.cash_price) - parseFloat(a.cash_price));
    }

    return filtered;
  }, [initialProducts, minPrice, maxPrice, selectedSpecs, sortBy]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (minPrice) count++;
    if (maxPrice) count++;
    Object.values(selectedSpecs).forEach((arr) => {
      count += arr.length;
    });
    return count;
  }, [minPrice, maxPrice, selectedSpecs]);

  // Active filter tags
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; value: string }[] = [];
    if (minPrice) tags.push({ key: "minPrice", label: `Preço Mín: R$ ${minPrice}`, value: minPrice });
    if (maxPrice) tags.push({ key: "maxPrice", label: `Preço Máx: R$ ${maxPrice}`, value: maxPrice });
    
    FILTER_CONFIGS.forEach((config) => {
      const selected = selectedSpecs[config.key] || [];
      selected.forEach((val) => {
        tags.push({ key: config.key, label: `${config.label}: ${val}`, value: val });
      });
    });
    return tags;
  }, [minPrice, maxPrice, selectedSpecs]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Title & Info */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 capitalize">
              {categoryName}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {filteredProducts.length === 1
                ? "1 promoção encontrada"
                : `${filteredProducts.length} promoções encontradas`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl text-sm font-bold border outline-none cursor-pointer"
              >
                <option value="relevance">Relevância</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-zinc-400" />
              </div>
            </div>

            {/* Filter Toggle Button (Always visible) */}
            <button
              onClick={() => setFiltersExpanded(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl text-sm font-bold border transition-all cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-600 text-white ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Ativos:</span>
            {activeFilterTags.map((tag) => (
              <span
                key={`${tag.key}-${tag.value}`}
                className="inline-flex items-center gap-1 bg-zinc-150 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 pl-3 pr-1.5 py-1 rounded-full font-medium"
              >
                {tag.label}
                <button
                  onClick={() => {
                    if (tag.key === "minPrice") setMinPrice("");
                    else if (tag.key === "maxPrice") setMaxPrice("");
                    else handleRemoveFilter(tag.key, tag.value);
                  }}
                  className="p-0.5 rounded-full hover:bg-zinc-250 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-8 items-start relative">
          {/* Sidebar Drawer */}
          {filtersExpanded && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                onClick={() => setFiltersExpanded(false)}
              />
              
              {/* Sidebar */}
              <aside className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col transition-all animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Filtros</span>
                  <div className="flex items-center gap-4">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                      >
                        Limpar tudo
                      </button>
                    )}
                    <button 
                      onClick={() => setFiltersExpanded(false)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Preços range and inputs (Scrollable content) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Preços (R$)
                    </h4>

                    <div className="relative h-2 bg-zinc-105 dark:bg-zinc-800 rounded-full mt-4 mb-2">
                      <div 
                        className="absolute h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{
                          left: `${((parseFloat(minPrice || absoluteMinPrice.toString()) - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100}%`,
                          right: `${100 - ((parseFloat(maxPrice || absoluteMaxPrice.toString()) - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min={absoluteMinPrice}
                        max={absoluteMaxPrice}
                        value={minPrice ? parseFloat(minPrice) : absoluteMinPrice}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), Number(maxPrice || absoluteMaxPrice));
                          setMinPrice(val.toString());
                        }}
                        className="absolute pointer-events-none appearance-none w-full h-2 bg-transparent top-0 left-0 accent-blue-600 dark:accent-blue-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-blue-600"
                      />
                      <input
                        type="range"
                        min={absoluteMinPrice}
                        max={absoluteMaxPrice}
                        value={maxPrice ? parseFloat(maxPrice) : absoluteMaxPrice}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), Number(minPrice || absoluteMinPrice));
                          setMaxPrice(val.toString());
                        }}
                        className="absolute pointer-events-none appearance-none w-full h-2 bg-transparent top-0 left-0 accent-blue-600 dark:accent-blue-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-blue-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1.5 text-[10px] text-zinc-400 dark:text-zinc-600">Mín</span>
                        <input
                          type="number"
                          placeholder={absoluteMinPrice.toString()}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <span className="text-zinc-400 text-xs">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1.5 text-[10px] text-zinc-400 dark:text-zinc-600">Máx</span>
                        <input
                          type="number"
                          placeholder={absoluteMaxPrice.toString()}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specifications Filters Box */}
                  {FILTER_CONFIGS.map((config) => {
                    const options = filterOptions[config.key] || [];
                    if (options.length === 0) return null;

                    const selected = selectedSpecs[config.key] || [];

                    return (
                      <div key={config.key} className="flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                          <span>{config.label}</span>
                          {selected.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                          )}
                        </h4>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                          {options.map((opt) => {
                            const isChecked = selected.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer select-none py-0.5"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleCheckboxChange(config.key, opt.value)}
                                    className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-900 cursor-pointer"
                                  />
                                  <span>{opt.value}</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                  {opt.count}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </>
          )}

          {/* Product Cards Grid */}
          <div className="flex-1 w-full">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  Nenhuma promoção atende aos filtros selecionados.
                </p>
                <button
                  onClick={handleClearAll}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
