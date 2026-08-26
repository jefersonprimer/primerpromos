"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Sun, Moon, Cpu, GitCompare } from "lucide-react";
import Link from "next/link";
import { getCategorySlug } from "@/app/lib/utils";
import SearchModal from "./SearchModal";

export default function Header() {
  return (
    <Suspense
      fallback={
        <div className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800" />
      }
    >
      <HeaderContent />
    </Suspense>
  );
}

function HeaderContent() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 10) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const initialTheme = isDark ? "dark" : "light";
    setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const onCategoryChange = (category: string | null) => {
    if (category) {
      const slug = getCategorySlug(category);
      router.push(`/${slug}`);
    } else {
      router.push("/");
    }
  };

  const [isPeripheralsOpen, setIsPeripheralsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const mainCategories = [
    { label: "Placas de vídeo", value: "Placa De Vídeo" },
    { label: "Processadores", value: "Processador" },
    { label: "Motherboards", value: "Placa-Mãe" },
    { label: "Gabinetes", value: "Gabinete" },
    { label: "Fontes", value: "Fonte" },
    { label: "Memórias RAM", value: "Memória RAM" },
    { label: "SSDs", value: "SSD" },
    { label: "Cadeiras", value: "Cadeira" },
    { label: "Smartphones", value: "Smartphone" },
    { label: "TVs", value: "TV" },
    { label: "Consoles", value: "Console" },
    { label: "Mochilas", value: "Mochila" },
    { label: "Acessórios", value: "Acessório" },
    { label: "Suportes", value: "Suporte" },
    { label: "Eletrodomésticos", value: "Eletrodoméstico" },
    { label: "Mesa", value: "Mesa" },
    { label: "Desktops", value: "Desktop" },
  ];

  const handleCategoryClick = (val: string) => {
    onCategoryChange(val);
    setIsCategoriesOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isSearchOpen
          ? "bg-white dark:bg-zinc-950"
          : "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex h-16 items-center justify-between gap-8">
          <div className="flex items-center gap-8 flex-1">
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

            {/* Navigation Links (Aligned to Left beside Logo) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-650 dark:text-zinc-350">
              <button
                onClick={() => onCategoryChange("Notebook")}
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Notebooks
              </button>

              <button
                onClick={() => onCategoryChange("Smartphone")}
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Smartphones
              </button>

              {/* Peripherals Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsPeripheralsOpen(true)}
                onMouseLeave={() => setIsPeripheralsOpen(false)}
              >
                <button className="flex items-center gap-1 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">
                  Periféricos
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isPeripheralsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isPeripheralsOpen && (
                  <div className="absolute -left-20 top-full mt-0 w-[540px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 p-3 shadow-xl z-50 grid grid-cols-3 gap-2 focus:outline-none">
                    {peripherals.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handlePeripheralClick(item.value)}
                        className="group/item flex flex-col justify-between text-left p-3 rounded-xl transition-all cursor-pointer border bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:border-zinc-100 dark:hover:border-zinc-800/50 text-zinc-750 dark:text-zinc-350"
                      >
                        <span className="text-xs font-bold tracking-wide">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button className="flex items-center gap-1 transition-colors hover:text-zinc-955 dark:hover:text-zinc-50">
                  Categorias
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute -left-20 top-full mt-0 w-[540px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 p-3 shadow-xl z-50 grid grid-cols-3 gap-2 focus:outline-none">
                    {mainCategories.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleCategoryClick(item.value)}
                        className="group/item flex flex-col justify-between text-left p-3 rounded-xl transition-all cursor-pointer border bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:border-zinc-100 dark:hover:border-zinc-800/50 text-zinc-750 dark:text-zinc-350"
                      >
                        <span className="text-xs font-bold tracking-wide">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Search and Theme Toggle Buttons on Right */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 p-2 lg:px-3 lg:py-1.5 rounded-xl transition-all text-zinc-650 dark:text-zinc-350 hover:text-zinc-950 dark:hover:text-zinc-50 lg:bg-zinc-100/60 dark:lg:bg-zinc-900/30 lg:border lg:border-zinc-200/50 dark:lg:border-zinc-800/40 text-xs font-semibold cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline text-zinc-500 dark:text-zinc-400">Buscar...</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-1.5 font-mono text-[9px] font-bold text-zinc-400 dark:text-zinc-550">
                <span>Ctrl</span>K
              </kbd>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 transition-colors text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              aria-label={
                theme === "light"
                  ? "Mudar para modo escuro"
                  : "Mudar para modo claro"
              }
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Subheader */}
      <div 
        className={`hidden md:block bg-transparent transition-all duration-300 ease-in-out ${
          isVisible || isSearchOpen || isPeripheralsOpen || isCategoriesOpen
            ? "max-h-12 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-6 overflow-hidden">
          {/* Left Side: Category Navigation Links (scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 flex-1 mr-4">
            {[
              { label: "Teclados", value: "Teclado" },
              { label: "Mouses", value: "Mouse" },
              { label: "Headsets", value: "Headset" },
              { label: "Acessórios", value: "Acessório" },
              { label: "Monitores", value: "Monitor" },
              { label: "Controles", value: "Controle" },
              { label: "Notebooks", value: "Notebook" },
              { label: "Consoles", value: "Console" },
              { label: "Mousepads", value: "Mousepad" },
              { label: "Microfones", value: "Microfone" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onCategoryChange(item.value)}
                className="text-xs font-bold whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side: Featured Tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Monte seu PC Button */}
            <Link
              href="/monte-seu-pc"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-755 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all duration-200 shrink-0"
            >
              <Cpu className="h-3.5 w-3.5" />
              Monte seu PC
            </Link>

            {/* Comparador Button */}
            <Link
              href="/comparador"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-850 dark:text-zinc-205 text-xs font-extrabold border border-zinc-200/80 dark:border-zinc-800/85 shadow-sm hover:shadow transition-all duration-200 shrink-0"
            >
              <GitCompare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500 animate-pulse" />
              Comparador
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Subheader (always present on small screens to filter/navigate) */}
      <div 
        className={`md:hidden flex items-center justify-start gap-3 px-4 overflow-x-auto scrollbar-none bg-transparent transition-all duration-300 ease-in-out ${
          isVisible || isSearchOpen
            ? "max-h-16 opacity-100 translate-y-0 py-2 pb-3"
            : "max-h-0 opacity-0 -translate-y-2 overflow-hidden py-0 pointer-events-none"
        }`}
      >
        {[
          { label: "Teclados", value: "Teclado" },
          { label: "Mouses", value: "Mouse" },
          { label: "Headsets", value: "Headset" },
          { label: "Acessórios", value: "Acessório" },
          { label: "Monitores", value: "Monitor" },
          { label: "Controles", value: "Controle" },
          { label: "Notebooks", value: "Notebook" },
          { label: "Consoles", value: "Console" },
          { label: "Mousepads", value: "Mousepad" },
          { label: "Microfones", value: "Microfone" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => onCategoryChange(item.value)}
            className="text-xs font-bold whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            {item.label}
          </button>
        ))}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <Link
          href="/monte-seu-pc"
          className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-sm shrink-0"
        >
          <Cpu className="h-3 w-3" />
          Monte seu PC
        </Link>
        <Link
          href="/comparador"
          className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-205 font-extrabold border border-zinc-200/80 dark:border-zinc-800/85 shadow-sm shrink-0"
        >
          <GitCompare className="h-3 w-3 text-blue-600 dark:text-blue-500" />
          Comparador
        </Link>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
