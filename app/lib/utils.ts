export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accent marks
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric (except spaces and hyphens)
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .trim();
}

// Map database categories to their preferred pluralized URL slugs
export const categoryToSlug: Record<string, string> = {
  "Mouse": "mouses",
  "Teclado": "teclados",
  "Headset": "headsets",
  "Acessório": "acessorios",
  "Monitor": "monitores",
  "Controle": "controles",
  "Notebook": "notebooks",
  "Mousepad": "mousepads",
  "Smartphone": "smartphones",
  "TV": "tvs",
  "Placa De Vídeo": "placas-de-video",
  "Processador": "processadores",
  "Placa-Mãe": "placas-mae",
  "Gabinete": "gabinetes",
  "Fonte": "fontes",
  "Memória RAM": "memorias-ram",
  "SSD": "ssds",
  "Cadeira": "cadeiras",
  "Console": "consoles",
  "Mochila": "mochilas",
  "Suporte": "suportes",
  "Eletrodoméstico": "eletrodomesticos",
  "Mesa": "mesa",
  "Desktop": "desktops",
};

// Map slugs (both plural and singular) back to their database categories
export const slugToCategory: Record<string, string> = {
  "mouses": "Mouse",
  "mouse": "Mouse",
  "teclados": "Teclado",
  "teclado": "Teclado",
  "headsets": "Headset",
  "headset": "Headset",
  "acessorios": "Acessório",
  "acessorio": "Acessório",
  "monitores": "Monitor",
  "monitor": "Monitor",
  "controles": "Controle",
  "controle": "Controle",
  "notebooks": "Notebook",
  "notebook": "Notebook",
  "mousepads": "Mousepad",
  "mousepad": "Mousepad",
  "smartphones": "Smartphone",
  "smartphone": "Smartphone",
  "tvs": "TV",
  "tv": "TV",
  "placas-de-video": "Placa De Vídeo",
  "placa-de-video": "Placa De Vídeo",
  "processadores": "Processador",
  "processador": "Processador",
  "placas-mae": "Placa-Mãe",
  "placa-mae": "Placa-Mãe",
  "gabinetes": "Gabinete",
  "gabinete": "Gabinete",
  "fontes": "Fonte",
  "fonte": "Fonte",
  "memorias-ram": "Memória RAM",
  "memoria-ram": "Memória RAM",
  "ssds": "SSD",
  "ssd": "SSD",
  "cadeiras": "Cadeira",
  "cadeira": "Cadeira",
  "consoles": "Console",
  "console": "Console",
  "mochilas": "Mochila",
  "mochila": "Mochila",
  "suportes": "Suporte",
  "suporte": "Suporte",
  "eletrodomesticos": "Eletrodoméstico",
  "eletrodomestico": "Eletrodoméstico",
  "mesa": "Mesa",
  "desktops": "Desktop",
  "desktop": "Desktop",
};

export function getCategorySlug(category: string): string {
  return categoryToSlug[category] || slugify(category);
}

export function getCategoryFromSlug(slug: string): string | null {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return slugToCategory[decoded] || null;
}

export function getProductSpec(specs: any, attrName: string): string | null {
  if (!specs || !Array.isArray(specs)) return null;
  for (const group of specs) {
    if (group && Array.isArray(group.values)) {
      const attr = group.values.find((v: any) => v && v.name && v.name.toLowerCase() === attrName.toLowerCase());
      if (attr && Array.isArray(attr.values) && attr.values.length > 0) {
        return attr.values.join(", ");
      }
    }
  }
  return null;
}

export function getNormalizedSpec(specs: any, filterKey: string): string | null {
  const mappings: Record<string, string[]> = {
    fabricante: ["Marca", "Marca - Celular"],
    processador: ["Processador"],
    placaVideo: ["Placa de Vídeo", "Placa de video", "GPU"],
    resolucao: ["Resolução da Tela", "Resolução"],
    taxaAtualizacao: ["Taxa de Atualização", "Taxa de atualizacao", "Frequência"],
    gamaCores: ["Gama de Cores", "Gama de cores", "Cores"],
    painel: ["Tipo de Tela", "Painel"],
    tamanho: ["Tamanho da Tela", "Tamanho"],
    ram: ["Memória Ram", "Memória RAM", "RAM"],
    armazenamento: ["Memória Interna", "Armazenamento", "HD", "SSD", "Capacidade"],
    sistemaOperacional: ["Sistema Operacional"],
  };

  const attrNames = mappings[filterKey];
  if (!attrNames) return null;

  for (const name of attrNames) {
    const val = getProductSpec(specs, name);
    if (val) return val;
  }
  return null;
}


