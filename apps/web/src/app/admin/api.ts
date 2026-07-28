import { API_BASE_URL } from "./constants";
import type { CatalogLimits, CatalogProduct, CatalogStatus } from "./types";

interface BasePayload {
  ok: boolean;
  message?: string;
}

interface LimitsPayload extends BasePayload {
  limits?: CatalogLimits;
}

interface ProductsPayload extends BasePayload {
  products?: CatalogProduct[];
}

async function readPayload<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function payloadError(
  payload: { message?: string } | null,
  fallback: string,
): string {
  return payload?.message ?? fallback;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "x-admin-token": token.trim(),
  };
}

export async function fetchCatalogLimits(): Promise<CatalogLimits | null> {
  const response = await fetch(`${API_BASE_URL}/api/catalog/config`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await readPayload<LimitsPayload>(response);
  if (!payload?.ok || !payload.limits) {
    return null;
  }

  return payload.limits;
}

export async function fetchAdminProducts(token: string): Promise<CatalogProduct[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/catalog/products`, {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  const payload = await readPayload<ProductsPayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo cargar el catalogo"));
  }

  return payload.products ?? [];
}

export async function createAdminProduct(
  token: string,
  input: { name: string; description: string; priceCop: number },
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/catalog/products`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await readPayload<BasePayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo crear el producto"));
  }
}

export async function updateAdminProduct(
  token: string,
  productId: string,
  input: {
    name: string;
    description: string;
    priceCop: number;
    status: CatalogStatus;
  },
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/catalog/products/${productId}`,
    {
      method: "PUT",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const payload = await readPayload<BasePayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo actualizar el producto"));
  }
}

export async function deleteAdminProduct(
  token: string,
  productId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/catalog/products/${productId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );

  const payload = await readPayload<BasePayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo eliminar el producto"));
  }
}

export async function uploadAdminProductMedia(
  token: string,
  productId: string,
  files: File[],
): Promise<void> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("media", file);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/catalog/products/${productId}/media`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    },
  );

  const payload = await readPayload<BasePayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo subir la multimedia"));
  }
}

export async function deleteAdminProductMedia(
  token: string,
  productId: string,
  mediaId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/catalog/products/${productId}/media/${mediaId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );

  const payload = await readPayload<BasePayload>(response);

  if (!response.ok || !payload?.ok) {
    throw new Error(payloadError(payload, "No se pudo eliminar el archivo"));
  }
}
