"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard, { type Product } from "./ProductCard";
import { ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <Suspense fallback={<div className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800" />}>
      <HeaderContent />
    </Suspense>
  );
}

function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");

  const onCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  };

  const [isPeripheralsOpen, setIsPeripheralsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mouseHasEntered, setMouseHasEntered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isSearchOpen && allProducts.length === 0) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllProducts(data);
          }
        })
        .catch((err) =>
          console.error(
            "Erro ao buscar produtos para o preview de busca:",
            err,
          ),
        );
    }
  }, [isSearchOpen, allProducts.length]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredPreviewProducts = searchQuery
    ? allProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.category &&
            product.category
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          product.source_site.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allProducts;

  const peripherals = [
    { label: "Mouses", value: "Mouse" },
    { label: "Teclados", value: "Teclado" },
    { label: "Headsets", value: "Headset" },
    { label: "Microfones", value: "Microfone" },
    { label: "Mousepads", value: "Mousepad" },
    { label: "Controles", value: "Controle" },
  ];

  const handlePeripheralClick = (val: string) => {
    onCategoryChange(val);
    setIsPeripheralsOpen(false);
  };

  const isPeripheralActive = peripherals.some(
    (p) => p.value === activeCategory,
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors ${isSearchOpen ? "bg-background" : "bg-background/80 backdrop-blur"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => onCategoryChange(null)}
            >
              <span className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-500">
                PRIMER
              </span>
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                PROMOS
              </span>
            </Link>

            {/* Navigation Links (Aligned to Left) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => onCategoryChange("Notebook")}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  activeCategory === "Notebook"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                Notebooks
              </button>

              <button
                onClick={() => onCategoryChange("Smartphone")}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  activeCategory === "Smartphone"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                Smartphones
              </button>

              {/* Peripherals Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsPeripheralsOpen(true)}
                onMouseLeave={() => setIsPeripheralsOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    isPeripheralActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Periféricos
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isPeripheralsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isPeripheralsOpen && (
                  <div className="absolute left-0 mt-0 w-48 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {peripherals.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handlePeripheralClick(item.value)}
                        className={`block w-full text-left px-4 py-2 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                          activeCategory === item.value
                            ? "text-blue-600 dark:text-blue-400 font-semibold bg-zinc-50 dark:bg-zinc-800/40"
                            : "text-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Search Button on Right */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setMouseHasEntered(false);
                setIsSearchOpen(true);
              }}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation (always present on small screens to filter) */}
      <div className="md:hidden flex items-center justify-start gap-4 px-4 pb-3 overflow-x-auto scrollbar-none border-t border-zinc-100 dark:border-zinc-800/40 pt-2">
        <button
          onClick={() => onCategoryChange("Notebook")}
          className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full ${
            activeCategory === "Notebook"
              ? "bg-blue-600 text-white font-semibold"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          Notebooks
        </button>
        <button
          onClick={() => onCategoryChange("Smartphone")}
          className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full ${
            activeCategory === "Smartphone"
              ? "bg-blue-600 text-white font-semibold"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          Smartphones
        </button>
        {peripherals.map((item) => (
          <button
            key={item.value}
            onClick={() => onCategoryChange(item.value)}
            className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full ${
              activeCategory === item.value
                ? "bg-blue-600 text-white font-semibold"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search Overlay Panel (takes 80vh, closes on mouse leave or when entering the 20% backdrop area below) */}
      {isSearchOpen && (
        <>
          <div
            onMouseEnter={() => {
              if (mouseHasEntered) {
                setIsSearchOpen(false);
              }
            }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 z-30 bg-black/10 dark:bg-black/30"
          />
          <div className="absolute top-full left-0 right-0 h-[calc(100vh-100%)] flex flex-col z-40">
            <div
              onMouseEnter={() => setMouseHasEntered(true)}
              onMouseLeave={() => {
                if (mouseHasEntered) {
                  setIsSearchOpen(false);
                }
              }}
              className="h-[80%] w-full bg-background  py-6 flex flex-col gap-6 overflow-y-auto shadow-xl"
            >
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 h-full">
                <div className="w-full flex items-center gap-3 pb-2">
                  <Search className="h-6 w-6 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="O que você está procurando?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                    className="w-full text-xl bg-transparent outline-none border-none py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0"
                      aria-label="Limpar busca"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="w-full flex-1 overflow-y-auto mt-4">
                  {searchQuery ? (
                    <>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                        Resultados encontrados
                      </h3>
                      {filteredPreviewProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                          {filteredPreviewProducts
                            .slice(0, 4)
                            .map((product) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                          Nenhuma promoção encontrada para esta busca.
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                        Links Rápidos
                      </h3>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            onCategoryChange(null);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer animate-fade-in"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
                          Promoções do Dia
                        </button>
                        <button
                          onClick={() => {
                            onCategoryChange("Notebook");
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
                          Notebooks
                        </button>
                        <button
                          onClick={() => {
                            onCategoryChange("Smartphone");
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
                          Smartphones
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Área de 20% com blur no final para fechar ao passar o mouse */}
            <div
              onMouseEnter={() => {
                if (mouseHasEntered) {
                  setIsSearchOpen(false);
                }
              }}
              onClick={() => setIsSearchOpen(false)}
              className="h-[20%] w-full bg-background/60 backdrop-blur-md border-t border-zinc-200/30 dark:border-zinc-800/30 cursor-pointer"
            />
          </div>
        </>
      )}
    </header>
  );
}
