import prisma from "@/app/lib/prisma";
import MonteSeuPcClient from "./MonteSeuPcClient";

export const revalidate = 0; // Ensure data is fetched fresh

export default async function MonteSeuPcPage() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        in: [
          "Processador",
          "Placa-Mãe",
          "Memória RAM",
          "Placa De Vídeo",
          "SSD",
          "HD",
          "Cooler",
          "Hardware/coolers/fan/120 Mm",
          "Fonte",
          "Gabinete",
          "Fans",
          "Ventoinha"
        ]
      }
    },
    orderBy: {
      created_at: "desc"
    }
  });

  // Prisma Decimals and Dates must be serialized to pass to the client component
  const serializedProducts = products.map((p) => ({
    ...p,
    cash_price: p.cash_price.toString(),
    installment_price: p.installment_price.toString(),
    created_at: p.created_at.toISOString(),
    specs: p.specs as Record<string, unknown> | null,
  }));

  return <MonteSeuPcClient initialProducts={serializedProducts} />;
}
