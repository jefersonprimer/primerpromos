"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCouponButton({ coupon }: { coupon: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3 justify-between">
      <div>
        <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold block mb-0.5">
          CUPOM DE DESCONTO
        </span>
        <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200 tracking-wider">
          {coupon}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
      >
        {copied ? (
          <>
            <Check size={14} />
            Copiado!
          </>
        ) : (
          <>
            <Copy size={14} />
            Copiar
          </>
        )}
      </button>
    </div>
  );
}
