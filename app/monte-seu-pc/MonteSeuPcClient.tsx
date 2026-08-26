"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Database, 
  Monitor, 
  Wind, 
  Zap, 
  Box,
  Plus
} from "lucide-react";
import { type Product } from "../components/ProductCard";

interface MonteSeuPcClientProps {
  initialProducts: Product[];
}

const TABS = [
  { id: "processador", label: "Processador", icon: Cpu },
  { id: "placa-mae", label: "Placa Mãe", icon: Layers },
  { id: "memoria-ram", label: "Memória RAM", icon: Layers },
  { id: "placa-de-video", label: "Placa de Vídeo", icon: Monitor },
  { id: "armazenamento", label: "Armazenamento", icon: Database },
  { id: "cooler", label: "Cooler", icon: Wind },
  { id: "fonte", label: "Fonte", icon: Zap },
  { id: "gabinete", label: "Gabinete", icon: Box },
  { id: "fans", label: "Fans", icon: Wind },
] as const;

type TabId = typeof TABS[number]["id"];

const ITEMS_PER_PAGE = 8;

export default function MonteSeuPcClient({ initialProducts }: MonteSeuPcClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("processador");
  const [build, setBuild] = useState<Record<TabId, Product | null>>({
    processador: null,
    "placa-mae": null,
    "memoria-ram": null,
    "placa-de-video": null,
    armazenamento: null,
    cooler: null,
    fonte: null,
    gabinete: null,
    fans: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<"all" | "AMD" | "Intel">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Load build from localStorage on mount
  useEffect(() => {
    try {
      const savedBuild = localStorage.getItem("primerpromos_pc_build");
      if (savedBuild) {
        const parsed = JSON.parse(savedBuild);
        const newBuild = { ...build };
        TABS.forEach(tab => {
          if (parsed[tab.id]) {
            newBuild[tab.id] = parsed[tab.id];
          }
        });
        setBuild(newBuild);
      }
    } catch (e) {
      console.error("Failed to load build from localStorage", e);
    }
  }, []);

  // Save build to localStorage when it changes
  const saveBuild = (newBuild: Record<TabId, Product | null>) => {
    setBuild(newBuild);
    try {
      localStorage.setItem("primerpromos_pc_build", JSON.stringify(newBuild));
    } catch (e) {
      console.error("Failed to save build to localStorage", e);
    }
  };

  // Reset pagination & filters on tab change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setBrandFilter("all");
  }, [activeTab]);

  // Filter products for the active tab
  const tabProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const cat = p.category;
      if (!cat) return false;
      if (activeTab === "processador") return cat === "Processador";
      if (activeTab === "placa-mae") return cat === "Placa-Mãe";
      if (activeTab === "memoria-ram") return cat === "Memória RAM";
      if (activeTab === "placa-de-video") return cat === "Placa De Vídeo";
      if (activeTab === "armazenamento") return ["SSD", "HD", "Armazenamento"].includes(cat);
      if (activeTab === "cooler") return ["Cooler", "Hardware/coolers/fan/120 Mm"].includes(cat);
      if (activeTab === "fonte") return cat === "Fonte";
      if (activeTab === "gabinete") return cat === "Gabinete";
      if (activeTab === "fans") return ["Fans", "Hardware/coolers/fan/120 Mm", "Ventoinha"].includes(cat);
      return false;
    });
  }, [initialProducts, activeTab]);

  // Filter & search logic
  const filteredProducts = useMemo(() => {
    let result = [...tabProducts];

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Brand filter (Specifically CPU/Motherboard, but applies to title)
    if (brandFilter !== "all") {
      const brandLower = brandFilter.toLowerCase();
      result = result.filter((p) => {
        const title = p.title.toLowerCase();
        if (brandLower === "amd") {
          return title.includes("amd") || title.includes("ryzen");
        } else if (brandLower === "intel") {
          return title.includes("intel") || title.includes("core");
        }
        return true;
      });
    }

    // Sort logic
    if (sortBy === "price_asc") {
      result.sort((a, b) => parseFloat(a.cash_price) - parseFloat(b.cash_price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => parseFloat(b.cash_price) - parseFloat(a.cash_price));
    }

    return result;
  }, [tabProducts, searchQuery, brandFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const selectComponent = (product: Product) => {
    const newBuild = {
      ...build,
      [activeTab]: product,
    };
    saveBuild(newBuild);
  };

  const removeComponent = (tabId: TabId) => {
    const newBuild = {
      ...build,
      [tabId]: null,
    };
    saveBuild(newBuild);
  };

  const clearBuild = () => {
    if (window.confirm("Deseja realmente limpar toda a sua configuração?")) {
      const newBuild = {
        processador: null,
        "placa-mae": null,
        "memoria-ram": null,
        "placa-de-video": null,
        armazenamento: null,
        cooler: null,
        fonte: null,
        gabinete: null,
        fans: null,
      };
      saveBuild(newBuild);
    }
  };

  // Calculations
  const totals = useMemo(() => {
    let cash = 0;
    let installment = 0;
    Object.values(build).forEach((product) => {
      if (product) {
        cash += parseFloat(product.cash_price);
        installment += parseFloat(product.installment_price);
      }
    });
    return { cash, installment };
  }, [build]);

  const configuredCount = useMemo(() => {
    return Object.values(build).filter(Boolean).length;
  }, [build]);

  const completionPercentage = useMemo(() => {
    return Math.round((configuredCount / TABS.length) * 100);
  }, [configuredCount]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Copy build to clipboard
  const handleShare = () => {
    let text = "🖥️ Minha Configuração de PC ideal - Primer Promos\n\n";
    let hasItems = false;

    TABS.forEach((tab) => {
      const item = build[tab.id];
      if (item) {
        hasItems = true;
        text += `• ${tab.label}: ${item.title} (${formatPrice(parseFloat(item.cash_price))})\n`;
      }
    });

    if (!hasItems) {
      alert("Selecione pelo menos um componente para compartilhar!");
      return;
    }

    text += `\n💰 Total à Vista: ${formatPrice(totals.cash)}`;
    text += `\n💳 Total a Prazo: ${formatPrice(totals.installment)}`;
    text += `\n\nMonte o seu também em: ${window.location.href}`;

    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Monte seu PC
            </h1>
            <p className="text-zinc-650 dark:text-zinc-400 mt-2 text-sm max-w-xl">
              Selecione as peças ideais para o seu setup. Nós buscamos os melhores preços nas maiores lojas de hardware do Brasil e calculamos tudo em tempo real.
            </p>
          </div>

          {/* Real-time Progress tracker */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 min-w-[280px] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Progresso do Setup</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{configuredCount} de {TABS.length} selecionados</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Selector Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-1.5 scrollbar-thin gap-2 border-b border-zinc-200 dark:border-zinc-800">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                const isConfigured = !!build[tab.id];
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border-b-2 relative ${
                      isSelected
                        ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/20"
                        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{tab.label}</span>
                    {isConfigured && (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={`Buscar em ${TABS.find(t => t.id === activeTab)?.label}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500/60 text-zinc-900 dark:text-zinc-100 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Brand Filter (Only CPU / Motherboard) */}
                {(activeTab === "processador" || activeTab === "placa-mae") && (
                  <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
                    <button
                      onClick={() => { setBrandFilter("all"); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        brandFilter === "all"
                          ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => { setBrandFilter("AMD"); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        brandFilter === "AMD"
                          ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100 border border-orange-500/25 dark:border-orange-500/40"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      AMD
                    </button>
                    <button
                      onClick={() => { setBrandFilter("Intel"); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        brandFilter === "Intel"
                          ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100 border border-blue-500/25 dark:border-blue-500/40"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      Intel
                    </button>
                  </div>
                )}

                {/* Sort Order Select */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as "relevance" | "price_asc" | "price_desc");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none cursor-pointer text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="relevance">Mais Procurados</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                </select>
              </div>

            </div>

            {/* Product Grid / Pagination */}
            {paginatedProducts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {paginatedProducts.map((product) => {
                    const isSelected = build[activeTab]?.id === product.id;
                    const formattedPrice = formatPrice(parseFloat(product.cash_price));

                    return (
                      <div
                        key={product.id}
                        onClick={() => selectComponent(product)}
                        className={`flex flex-col bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden p-4 justify-between transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="w-24 h-24 bg-white shrink-0 flex items-center justify-center p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-inner relative group-hover:scale-102 transition-transform">
                            {product.image_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] text-zinc-400">Sem Foto</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                            <span className="inline-block self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 uppercase tracking-wider">
                              {product.source_site}
                            </span>
                            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {product.title}
                            </h3>
                          </div>
                        </div>

                        {/* Footer details & Action */}
                        <div className="flex justify-between items-end mt-4 pt-3 border-t border-zinc-150 dark:border-zinc-800/60">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-zinc-950 dark:text-zinc-50 tracking-tight">
                              {formattedPrice}
                            </span>
                            <span className="text-[10px] text-zinc-550 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                              à vista ou {formatPrice(parseFloat(product.installment_price))}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectComponent(product);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
                                : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm shadow-blue-500/10"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Selecionado
                              </>
                            ) : (
                              "Selecionar"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-zinc-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = currentPage === pageNum;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isCurrent
                              ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                              : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-zinc-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <p className="text-zinc-550 dark:text-zinc-400 text-sm font-medium">
                  {searchQuery 
                    ? "Nenhum produto atende a sua pesquisa nesta aba." 
                    : `Não há produtos cadastrados para a categoria ${TABS.find(t => t.id === activeTab)?.label}.`}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Limpar pesquisa
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Right Build Summary Column (PC Setup Receipt) */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md sticky top-24">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-150 dark:border-zinc-800/60 mb-4">
              <h2 className="font-bold text-zinc-950 dark:text-white text-lg flex items-center gap-2">
                <span>Seu Setup</span>
                {configuredCount > 0 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    {configuredCount} Peças
                  </span>
                )}
              </h2>
              
              {configuredCount > 0 && (
                <button
                  onClick={clearBuild}
                  className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer"
                  title="Limpar configuração"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {/* List of slots */}
            <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
              {TABS.map((tab) => {
                const item = build[tab.id];
                
                if (item) {
                  return (
                    <div 
                      key={tab.id}
                      className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Selected Item Mini-thumbnail */}
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center p-1 shrink-0 shadow-sm">
                          {item.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <tab.icon className="h-4.5 w-4.5 text-zinc-450" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-wider">{tab.label}</span>
                          <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[130px] sm:max-w-[180px] md:max-w-[280px] lg:max-w-[130px]" title={item.title}>
                            {item.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {formatPrice(parseFloat(item.cash_price))}
                        </span>
                        <button
                          onClick={() => removeComponent(tab.id)}
                          className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex justify-between items-center gap-3 p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:bg-blue-50/5 dark:hover:bg-blue-950/5 text-left transition-all duration-150 cursor-pointer ${
                        activeTab === tab.id ? "border-blue-500/60 ring-2 ring-blue-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100/60 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-400 dark:text-zinc-550 shrink-0">
                          <tab.icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{tab.label}</span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 italic font-medium">Vazio</span>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-zinc-400 hover:text-blue-500 transition-colors" />
                    </button>
                  );
                }
              })}
            </div>

            {/* Total Pricing Box */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl p-4 space-y-3 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total à Vista:</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {formatPrice(totals.cash)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 dark:border-zinc-850">
                <span className="text-xs text-zinc-500 dark:text-zinc-450 font-medium">Total a Prazo:</span>
                <span className="text-sm font-bold text-zinc-750 dark:text-zinc-200">
                  {formatPrice(totals.installment)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleShare}
              disabled={configuredCount === 0}
              className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
                configuredCount === 0
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-650 cursor-not-allowed border-none"
                  : shareSuccess
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10"
                    : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/10"
              }`}
            >
              {shareSuccess ? (
                <>
                  <Check className="h-4.5 w-4.5" /> Configuração Copiada!
                </>
              ) : (
                <>
                  <Share2 className="h-4.5 w-4.5" /> Compartilhar Setup
                </>
              )}
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}
