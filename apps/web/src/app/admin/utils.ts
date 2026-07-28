import { API_BASE_URL } from "./constants";
import type { CatalogProduct, ProductDraft } from "./types";

export function formatMoneyCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  const kb = value / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

export function emptyDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    priceCop: "",
    status: "draft",
  };
}

export function buildDraftMap(
  products: CatalogProduct[],
): Record<string, ProductDraft> {
  const draftMap: Record<string, ProductDraft> = {};

  for (const product of products) {
    draftMap[product.id] = {
      name: product.name,
      description: product.description,
      priceCop: String(product.priceCop),
      status: product.status,
    };
  }

  return draftMap;
}
