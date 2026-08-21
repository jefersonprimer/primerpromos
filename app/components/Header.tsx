"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Sun, Moon } from "lucide-react";
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
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300"
              >
                Notebooks
              </button>

              <button
                onClick={() => onCategoryChange("Smartphone")}
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300"
              >
                Smartphones
              </button>

              {/* Peripherals Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsPeripheralsOpen(true)}
                onMouseLeave={() => setIsPeripheralsOpen(false)}
              >
                <button className="flex items-center gap-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300">
                  Periféricos
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isPeripheralsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isPeripheralsOpen && (
                  <div className="absolute -left-32 top-full mt-0.5 w-[540px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md p-3 shadow-xl z-50 grid grid-cols-3 gap-2 focus:outline-none">
                    {peripherals.map((item) => {
                      return (
                        <button
                          key={item.value}
                          onClick={() => handlePeripheralClick(item.value)}
                          className="group/item flex flex-col justify-between text-left p-3 rounded-xl transition-all cursor-pointer border bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:border-zinc-100 dark:hover:border-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold tracking-wide">
                              {item.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Categories Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button className="flex items-center gap-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300">
                  Categorias
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute -left-32 top-full mt-0.5 w-[540px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md p-3 shadow-xl z-50 grid grid-cols-3 gap-2 focus:outline-none">
                    {mainCategories.map((item) => {
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleCategoryClick(item.value)}
                          className="group/item flex flex-col justify-between text-left p-3 rounded-xl transition-all cursor-pointer border bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:border-zinc-100 dark:hover:border-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold tracking-wide">
                              {item.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                href="/monte-seu-pc"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300 font-semibold text-blue-600 dark:text-blue-400"
              >
                Monte seu PC
              </Link>

              <Link
                href="/comparador"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300 font-semibold text-blue-600 dark:text-blue-400"
              >
                Comparador
              </Link>
            </nav>
          </div>

          {/* Search and Theme Toggle Buttons on Right */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 transition-colors text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
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

      {/* Mobile navigation (always present on small screens to filter) */}
      <div className="md:hidden flex items-center justify-start gap-4 px-4 pb-3 overflow-x-auto scrollbar-none border-t border-zinc-100 dark:border-zinc-800/40 pt-2">
        <Link
          href="/monte-seu-pc"
          className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/50"
        >
          Monte seu PC
        </Link>
        <Link
          href="/comparador"
          className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/50"
        >
          Comparador
        </Link>
        <button
          onClick={() => onCategoryChange("Notebook")}
          className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        >
          Notebooks
        </button>
        <button
          onClick={() => onCategoryChange("Smartphone")}
          className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        >
          Smartphones
        </button>
        {peripherals.map((item) => (
          <button
            key={item.value}
            onClick={() => onCategoryChange(item.value)}
            className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          >
            {item.label}
          </button>
        ))}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
