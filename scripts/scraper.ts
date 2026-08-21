import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL or DIRECT_URL is required in the environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Standardize category names to singular and capitalized format
function normalizeCategory(rawCategory: string | null | undefined): string | null {
  if (!rawCategory) return null;
  const clean = rawCategory.trim().toLowerCase();
  
  if (clean.includes('celular') || clean.includes('smartphone') || clean.includes('iphone')) {
    return 'Smartphone';
  }
  if (clean.includes('notebook') || clean.includes('laptop') || clean.includes('macbook')) {
    return 'Notebook';
  }
  if (clean.includes('mousepad')) {
    return 'Mousepad';
  }
  if (clean.includes('mouse')) {
    return 'Mouse';
  }
  if (clean.includes('teclado')) {
    return 'Teclado';
  }
  if (clean.includes('headset') || clean.includes('fone')) {
    return 'Headset';
  }
  if (clean.includes('microfone')) {
    return 'Microfone';
  }
  if (clean.includes('controle')) {
    return 'Controle';
  }
  if (clean.includes('tv') || clean.includes('televis')) {
    return 'TV';
  }
  if (clean.includes('geladeira') || clean.includes('refrigerador')) {
    return 'Geladeira';
  }
  if (clean.includes('lavadora') || clean.includes('máquina de lavar') || clean.includes('lava e seca')) {
    return 'Lavadora';
  }
  if (clean.includes('placa de vídeo') || clean.includes('placa de video') || clean.includes('gpu') || clean.includes('graphics card')) {
    return 'Placa De Vídeo';
  }
  if (clean.includes('processador') || clean.includes('cpu')) {
    return 'Processador';
  }
  if (clean.includes('placa-mãe') || clean.includes('placa mãe') || clean.includes('motherboard')) {
    return 'Placa-Mãe';
  }
  if (clean.includes('gabinete')) {
    return 'Gabinete';
  }
  if (clean.includes('fonte')) {
    return 'Fonte';
  }
  if (clean.includes('memória ram') || clean.includes('memoria ram') || clean.includes('ram')) {
    return 'Memória RAM';
  }
  if (clean.includes('ssd')) {
    return 'SSD';
  }
  if (clean.includes('cadeira')) {
    return 'Cadeira';
  }
  if (clean.includes('console')) {
    return 'Console';
  }
  if (clean.includes('mochila')) {
    return 'Mochila';
  }
  if (clean.includes('suporte')) {
    return 'Suporte';
  }
  if (clean.includes('eletrodoméstico') || clean.includes('eletrodomestico') || clean.includes('eletroportáteis') || clean.includes('eletroportateis') || clean.includes('aspirador')) {
    return 'Eletrodoméstico';
  }
  if (clean.includes('mesa')) {
    return 'Mesa';
  }
  if (clean.includes('desktop') || clean.includes('computador') || clean.includes('pc')) {
    return 'Desktop';
  }
  if (clean.includes('monitor')) {
    return 'Monitor';
  }
  if (clean.includes('acessório') || clean.includes('acessorio')) {
    return 'Acessório';
  }
  if (clean.includes('tablet') || clean.includes('ipad')) {
    return 'Tablet';
  }
  if (clean.includes('ar-condicionado') || clean.includes('ar condicionado')) {
    return 'Ar-condicionado';
  }

  // Capitalize first letter of each word as fallback
  return rawCategory
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface DailyHistoryItem {
  lowestPrice: number;
  lowestInstallmentPrice: number;
  date: string;
}
interface BenchPromosHistoryResponse {
  data?: {
    productHistory?: {
      dailyHistory?: DailyHistoryItem[];
    };
  };
}

async function fetchBenchPromosHistory(slug: string): Promise<DailyHistoryItem[]> {
  try {
    const url = 'https://benchpromos-api.com/graphql';
    const query = `
      query GetProductHistory($productId: String!) {
        productHistory(productId: $productId) {
          dailyHistory {
            lowestPrice
            lowestInstallmentPrice
            date
          }
        }
      }
    `;
    const variables = {
      input: {
        productId: slug
      }
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer UfLk014eu5loeUzkBWi67ku9s2FGdNuFTmxcysQGO7BZS0NfIQQyCXpQ1GzAHDUHfQKTJDnAIBSQAOmYbnnczuoe5ys8maufkBpk73kbqGzeWYD9qGysLXidBMzWeDnN'
      },
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) return [];
    const data = await response.json() as BenchPromosHistoryResponse;
    return data?.data?.productHistory?.dailyHistory || [];
  } catch (error) {
    console.error(`Error fetching Bench Promos history for ${slug}:`, error);
    return [];
  }
}

interface BuscapeProductDetails {
  history: { date: string; price: number }[];
  offers: {
    store_name: string;
    cash_price: number;
    installment_price: number;
    installments_count: number;
    store_url: string;
    image_url: string | null;
  }[];
  specs?: Record<string, unknown>;
}

async function fetchBuscapeProductDetails(productUrl: string): Promise<BuscapeProductDetails> {
  const result: BuscapeProductDetails = { history: [], offers: [] };
  try {
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) return result;
    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!match || !match[1]) return result;
    
    const nextData = JSON.parse(match[1]);
    const reduxState = nextData?.props?.initialReduxState;
    if (!reduxState) return result;

    // Parse History
    const historyRoot = reduxState?.priceHistory?.priceHistory;
    if (historyRoot) {
      const productIds = Object.keys(historyRoot);
      if (productIds.length > 0) {
        const firstProductHistory = historyRoot[productIds[0]];
        if (firstProductHistory && Array.isArray(firstProductHistory.days)) {
          result.history = firstProductHistory.days.map((d: { date: string; price: number }) => ({
            date: d.date,
            price: d.price
          }));
        }
      }
    }

    // Parse Specs
    const productsRoot = reduxState?.products;
    if (productsRoot) {
      const productKeys = Object.keys(productsRoot);
      if (productKeys.length > 0) {
        const firstProd = productsRoot[productKeys[0]];
        if (firstProd && firstProd.attributes) {
          result.specs = firstProd.attributes;
        }
      }
    }

    // Parse Offers
    const rawOffers = [
      ...(reduxState?.offers?.displayOffers || []),
      ...(reduxState?.offers?.offerList || [])
    ];

    const seenUrls = new Set<string>();
    for (const off of rawOffers) {
      if (!off.id || !off.sellerName) continue;
      const storeUrl = `https://www.buscape.com.br/lead?oid=${off.id}`;
      if (seenUrls.has(storeUrl)) continue;
      seenUrls.add(storeUrl);

      result.offers.push({
        store_name: off.sellerName,
        cash_price: off.price,
        installment_price: off.totalParceledValue || off.price,
        installments_count: off.numParcels || 1,
        store_url: storeUrl,
        image_url: off.imageUrl || null
      });
    }
  } catch (error) {
    console.error(`Error fetching Buscapé details for ${productUrl}:`, error);
  }
  return result;
}



async function scrapeBenchPromos() {
  console.log('--- Scraping Bench Promos ---');
  try {
    const response = await fetch('https://benchpromos.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Find the script tag containing the Apollo/SSR data transport JSON
    const scriptRegex = /window\[Symbol\.for\("ApolloSSRDataTransport"\)\]\s*\?\?=\s*\[\]\)\.push\(([\s\S]*?)\);?$/m;
    const match = html.match(scriptRegex);
    
    interface SaleItem {
      id: string | number;
      slug: string;
      title?: string;
      caption?: string;
      review?: string;
      imageUrl?: string;
      price?: number;
      installments?: number;
      totalInstallmentPrice?: number;
      couponSchema?: { code?: string };
      coupon?: string;
      url?: string;
      category?: { name?: string };
    }

    interface ApolloSSRData {
      json?: {
        rehydrate?: Record<string, {
          data?: {
            sales?: {
              list?: SaleItem[];
            };
          };
        }>;
      };
    }

    let jsonData: ApolloSSRData | null = null;
    if (match && match[1]) {
      try {
        jsonData = JSON.parse(match[1]) as ApolloSSRData;
      } catch {
        // Fallback
      }
    }

    // Fallback if the first regex was not exact enough
    if (!jsonData) {
      const fallbackRegex = /window\[Symbol\.for\("ApolloSSRDataTransport"\)\]\s*\?\?=\s*\[\]\)\.push\((\{[\s\S]*?\})\)/;
      const fallbackMatch = html.match(fallbackRegex);
      if (fallbackMatch && fallbackMatch[1]) {
        try {
          jsonData = JSON.parse(fallbackMatch[1]) as ApolloSSRData;
        } catch {
          // ignore
        }
      }
    }

    if (!jsonData) {
      throw new Error('Could not extract Apollo SSR Data Transport.');
    }

    const rehydrateData = jsonData?.json?.rehydrate;
    if (!rehydrateData) {
      throw new Error('Rehydrate data not found.');
    }

    let salesList: SaleItem[] = [];
    for (const key of Object.keys(rehydrateData)) {
      const sales = rehydrateData[key]?.data?.sales;
      if (sales && Array.isArray(sales.list)) {
        salesList = sales.list;
        break;
      }
    }

    if (salesList.length === 0) {
      throw new Error('No sales found.');
    }

    const latestSales = salesList.slice(0, 20);
    console.log(`Processing the last ${latestSales.length} items from Bench Promos...`);

    let savedCount = 0;
    for (const sale of latestSales) {
      const id = sale.id;
      const slug = sale.slug;
      const title = sale.title || 'Produto sem título';
      const description = sale.caption || sale.review || '';
      const imageUrl = sale.imageUrl || '';
      const cashPrice = sale.price ? sale.price / 100 : 0;
      const installmentsCount = sale.installments || 1;
      const installmentPrice = sale.totalInstallmentPrice ? sale.totalInstallmentPrice / 100 : cashPrice;
      const coupon = sale.couponSchema?.code || sale.coupon || null;
      const productUrl = `https://benchpromos.com.br/promocao/${slug}/${id}`;
      const storeUrl = sale.url || null;
      const category = normalizeCategory(sale.category?.name);

      const dbProduct = await prisma.product.upsert({
        where: { product_url: productUrl },
        update: {
          title,
          category,
          description,
          image_url: imageUrl,
          cash_price: cashPrice,
          installment_price: installmentPrice,
          installments_count: installmentsCount,
          coupon,
          store_url: storeUrl,
        },
        create: {
          source_site: 'benchpromos',
          title,
          category,
          description,
          image_url: imageUrl,
          cash_price: cashPrice,
          installment_price: installmentPrice,
          installments_count: installmentsCount,
          coupon,
          product_url: productUrl,
          store_url: storeUrl,
        },
      });

      // Fetch and save history
      console.log(`Fetching history for Bench Promos product: ${slug}`);
      const history = await fetchBenchPromosHistory(slug);
      for (const h of history) {
        if (!h.date || h.lowestPrice === undefined) continue;
        const dateObj = new Date(h.date);
        await prisma.priceHistory.upsert({
          where: {
            product_id_date: {
              product_id: dbProduct.id,
              date: dateObj
            }
          },
          update: {
            price: h.lowestPrice / 100,
            installment_price: h.lowestInstallmentPrice ? h.lowestInstallmentPrice / 100 : null
          },
          create: {
            product_id: dbProduct.id,
            date: dateObj,
            price: h.lowestPrice / 100,
            installment_price: h.lowestInstallmentPrice ? h.lowestInstallmentPrice / 100 : null
          }
        });
      }

      savedCount++;
    }
    console.log(`Synchronized ${savedCount} Bench Promos products.`);
  } catch (error) {
    console.error('Error during Bench Promos scraping:', error);
  }
}

async function scrapeBuscape() {
  console.log('--- Scraping Buscapé ---');
  try {
    const response = await fetch('https://www.buscape.com.br/landing-page/oferta-do-dia-buscape', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Buscapé: ${response.statusText}`);
    }

    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    
    if (!match || !match[1]) {
      throw new Error('Could not find __NEXT_DATA__ in Buscapé HTML.');
    }

    const nextData = JSON.parse(match[1]);
    const pageProps = nextData?.props?.pageProps;
    if (!pageProps || !pageProps.landingPageData) {
      throw new Error('Buscapé landingPageData is missing in nextData.');
    }

    interface BuscapeItem {
      type: string;
      name: string;
      price: number;
      image?: string;
      rating?: number | string;
      bestOffer?: { merchantName?: string };
      categoryName?: string;
      url: string;
    }

    const buscapeProducts: BuscapeItem[] = [];
    const landingPageData = pageProps.landingPageData;
    
    // Extract products from all sections in landingPageData
    for (const sectionKey of Object.keys(landingPageData)) {
      const section = landingPageData[sectionKey];
      if (section && typeof section === 'object') {
        for (const itemKey of Object.keys(section)) {
          const item = section[itemKey];
          if (item && item.type === 'product' && item.name && item.price) {
            buscapeProducts.push(item);
          }
        }
      }
    }

    if (buscapeProducts.length === 0) {
      throw new Error('No products found in Buscapé landingPageData.');
    }

    console.log(`Found ${buscapeProducts.length} total products. Syncing the top 20...`);
    const top20Products = buscapeProducts.slice(0, 20);
    
    let savedCount = 0;
    for (const item of top20Products) {
      const title = item.name;
      const imageUrl = item.image || '';
      const cashPrice = item.price; // Buscapé prices are in BRL float directly
      const rating = item.rating ? `⭐ ${item.rating}` : 'N/A';
      const storeName = item.bestOffer?.merchantName || 'Melhor oferta';
      const description = `Categoria: ${item.categoryName || 'Geral'} | Avaliação: ${rating} | Menor preço em: ${storeName}`;
      const productUrl = `https://www.buscape.com.br${item.url}`;
      const category = normalizeCategory(item.categoryName);
      
      const dbProduct = await prisma.product.upsert({
        where: { product_url: productUrl },
        update: {
          title,
          category,
          description,
          image_url: imageUrl,
          cash_price: cashPrice,
          installment_price: cashPrice, // fallback as installment price is not directly present
          installments_count: 1,
          coupon: null,
          store_url: productUrl,
        },
        create: {
          source_site: 'buscape',
          title,
          category,
          description,
          image_url: imageUrl,
          cash_price: cashPrice,
          installment_price: cashPrice,
          installments_count: 1,
          coupon: null,
          product_url: productUrl,
          store_url: productUrl,
        },
      });

      // Fetch and save details (history and offers)
      console.log(`Fetching details for Buscapé product: ${productUrl}`);
      const details = await fetchBuscapeProductDetails(productUrl);
      
      if (details.specs) {
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { specs: details.specs }
        });
      }
      // Save history
      for (const h of details.history) {
        if (!h.date || h.price === undefined) continue;
        const dateObj = new Date(h.date);
        await prisma.priceHistory.upsert({
          where: {
            product_id_date: {
              product_id: dbProduct.id,
              date: dateObj
            }
          },
          update: {
            price: h.price,
            installment_price: h.price
          },
          create: {
            product_id: dbProduct.id,
            date: dateObj,
            price: h.price,
            installment_price: h.price
          }
        });
      }

      // Save offers
      if (details.offers.length > 0) {
        // Delete old offers first to keep it fresh
        await prisma.offer.deleteMany({
          where: { product_id: dbProduct.id }
        });

        // Insert new offers
        await prisma.offer.createMany({
          data: details.offers.map(off => ({
            product_id: dbProduct.id,
            store_name: off.store_name,
            cash_price: off.cash_price,
            installment_price: off.installment_price,
            installments_count: off.installments_count,
            store_url: off.store_url,
            image_url: off.image_url
          }))
        });
        console.log(`Saved ${details.offers.length} secondary offers for product: ${title}`);
      }

      savedCount++;
    }
    console.log(`Synchronized ${savedCount} Buscapé products.`);
  } catch (error) {
    console.error('Error during Buscapé scraping:', error);
  }
}

async function scrapeKabum() {
  console.log('--- Scraping KaBuM! ---');
  const urls = [
    { url: 'https://www.kabum.com.br/promocao/maisvendidos', type: 'maisvendidos' },
    { url: 'https://www.kabum.com.br/ofertas/quinzenagamer', type: 'quinzenagamer' }
  ];

  for (const { url, type } of urls) {
    try {
      console.log(`Fetching KaBuM! ${type} from ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch KaBuM! ${type}: ${response.statusText}`);
        continue;
      }

      const html = await response.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      
      if (!match || !match[1]) {
        console.error(`Could not find __NEXT_DATA__ in KaBuM! ${type}`);
        continue;
      }

      const nextData = JSON.parse(match[1]);
      const pageProps = nextData?.props?.pageProps;
      
      interface KabumItem {
        code: string | number;
        name: string;
        image?: string;
        priceWithDiscount?: number;
        price?: number;
        maxInstallment?: string | number;
        friendlyString?: string;
        description?: string;
      }

      let products: KabumItem[] = [];
      if (type === 'maisvendidos') {
        const catalogServer = pageProps?.data?.catalogServer;
        if (catalogServer && Array.isArray(catalogServer.data)) {
          products = catalogServer.data;
        }
      } else if (type === 'quinzenagamer') {
        const dataOfferServer = pageProps?.dataOfferServer;
        if (dataOfferServer && Array.isArray(dataOfferServer.data)) {
          products = dataOfferServer.data;
        }
      }

      console.log(`Found ${products.length} products on KaBuM! ${type}. Syncing the top 20...`);
      const top20 = products.slice(0, 20);

      let savedCount = 0;
      for (const item of top20) {
        const code = item.code;
        if (!code) continue;

        const title = item.name || '';
        const imageUrl = item.image || '';
        const cashPrice = item.priceWithDiscount || item.price || 0;
        const installmentPrice = item.price || cashPrice;
        
        // Parse installments count
        let installmentsCount = 1;
        if (item.maxInstallment) {
          const instMatch = String(item.maxInstallment).match(/^(\d+)x/i);
          if (instMatch) {
            installmentsCount = parseInt(instMatch[1], 10);
          }
        }

        // Parse coupon
        let coupon: string | null = null;
        if (item.stamp && item.stamp.name) {
          const stampName = String(item.stamp.name).trim();
          if (stampName.toUpperCase().startsWith('CUPOM ')) {
            coupon = stampName.slice(6).trim();
          } else {
            coupon = stampName;
          }
        }

        const category = normalizeCategory(item.category);
        const productUrl = `https://www.kabum.com.br/produto/${code}`;
        const storeUrl = productUrl;
        
        // Build description
        const manufacturer = item.manufacturer?.name || item.manufacturer || '';
        const rating = item.averageRating || item.rating || 'N/A';
        const description = `Fabricante: ${manufacturer} | Avaliação: ${rating} | Oferta KaBuM!`;

        const dbProduct = await prisma.product.upsert({
          where: { product_url: productUrl },
          update: {
            title,
            category,
            description,
            image_url: imageUrl,
            cash_price: cashPrice,
            installment_price: installmentPrice,
            installments_count: installmentsCount,
            coupon,
            store_url: storeUrl,
          },
          create: {
            source_site: 'kabum',
            title,
            category,
            description,
            image_url: imageUrl,
            cash_price: cashPrice,
            installment_price: installmentPrice,
            installments_count: installmentsCount,
            coupon,
            product_url: productUrl,
            store_url: storeUrl,
          },
        });

        // Add to history
        const dateObj = new Date();
        dateObj.setUTCHours(0, 0, 0, 0);
        await prisma.priceHistory.upsert({
          where: {
            product_id_date: {
              product_id: dbProduct.id,
              date: dateObj
            }
          },
          update: {
            price: cashPrice,
            installment_price: installmentPrice
          },
          create: {
            product_id: dbProduct.id,
            date: dateObj,
            price: cashPrice,
            installment_price: installmentPrice
          }
        });

        savedCount++;
      }
      console.log(`Synchronized ${savedCount} KaBuM! ${type} products.`);
    } catch (error) {
      console.error(`Error during KaBuM! ${type} scraping:`, error);
    }
  }
}

async function main() {
  try {
    await scrapeBenchPromos();
    await scrapeBuscape();
    await scrapeKabum();
    console.log('All scraper operations completed successfully!');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

