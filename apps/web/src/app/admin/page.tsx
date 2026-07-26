"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CatalogStatus = "draft" | "published";
type MediaType = "image" | "video";

interface CatalogMedia {
  id: string;
  type: MediaType;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  priceCop: number;
  status: CatalogStatus;
  media: CatalogMedia[];
  createdAt: string;
  updatedAt: string;
}

interface CatalogLimits {
  maxImagesPerProduct: number;
  maxVideosPerProduct: number;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  maxTotalBytesPerProduct: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
}

interface ProductDraft {
  name: string;
  description: string;
  priceCop: string;
  status: CatalogStatus;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const LOCAL_STORAGE_TOKEN_KEY = "mife_admin_token";
const ACCEPTED_MEDIA =
  "image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm";

function formatMoneyCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBytes(value: number): string {
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

function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

function emptyDraft(): ProductDraft {
  return {
    name: "",
    description: "",
    priceCop: "",
    status: "draft",
  };
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const [limits, setLimits] = useState<CatalogLimits | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Formulario principal para crear producto.
  const [newProduct, setNewProduct] = useState<ProductDraft>(emptyDraft());

  const canUseAdminActions = token.trim().length > 0;

  const headers = useMemo(() => {
    const currentToken = token.trim();

    if (!currentToken) {
      return undefined;
    }

    return {
      "x-admin-token": currentToken,
    };
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) ?? "";
    setToken(stored);
  }, []);

  useEffect(() => {
    // Carga limites publicos del backend para mostrarlos en pantalla.
    const loadLimits = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog/config`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          ok: boolean;
          limits?: CatalogLimits;
        };

        if (payload.ok && payload.limits) {
          setLimits(payload.limits);
        }
      } catch {
        // Si falla, solo ocultamos la tarjeta de limites.
      }
    };

    void loadLimits();
  }, []);

  useEffect(() => {
    if (!canUseAdminActions) {
      setProducts([]);
      setDrafts({});
      return;
    }

    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseAdminActions, headers]);

  const fetchProducts = async () => {
    if (!headers) {
      return;
    }

    setLoadingProducts(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/catalog/products`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        products?: CatalogProduct[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo cargar el catalogo");
      }

      const allProducts = payload.products ?? [];
      setProducts(allProducts);

      const draftMap: Record<string, ProductDraft> = {};
      for (const product of allProducts) {
        draftMap[product.id] = {
          name: product.name,
          description: product.description,
          priceCop: String(product.priceCop),
          status: product.status,
        };
      }

      setDrafts(draftMap);
      setMessage("Catalogo cargado correctamente.");
    } catch (fetchError) {
      const fetchMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Error al consultar productos";
      setError(fetchMessage);
    } finally {
      setLoadingProducts(false);
    }
  };

  const saveToken = () => {
    const trimmed = token.trim();
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, trimmed);
    setToken(trimmed);
    setMessage("Token guardado en este navegador.");
    setError("");
  };

  const clearToken = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setToken("");
    setProducts([]);
    setDrafts({});
    setSelectedFiles({});
    setMessage("Sesion admin cerrada.");
    setError("");
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!headers) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/catalog/products`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          priceCop: Number(newProduct.priceCop),
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo crear el producto");
      }

      setNewProduct(emptyDraft());
      setMessage("Producto creado en borrador.");
      await fetchProducts();
    } catch (createError) {
      const createMessage =
        createError instanceof Error
          ? createError.message
          : "Error al crear producto";
      setError(createMessage);
    } finally {
      setCreating(false);
    }
  };

  const updateProductField = (
    productId: string,
    field: keyof ProductDraft,
    value: string,
  ) => {
    setDrafts((previous) => ({
      ...previous,
      [productId]: {
        ...(previous[productId] ?? emptyDraft()),
        [field]: value,
      },
    }));
  };

  const saveProduct = async (productId: string) => {
    if (!headers) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    const draft = drafts[productId];
    if (!draft) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/catalog/products/${productId}`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: draft.name,
            description: draft.description,
            priceCop: Number(draft.priceCop),
            status: draft.status,
          }),
        },
      );

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo actualizar el producto");
      }

      setMessage("Producto actualizado.");
      await fetchProducts();
    } catch (updateError) {
      const updateMessage =
        updateError instanceof Error
          ? updateError.message
          : "Error al actualizar producto";
      setError(updateMessage);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!headers) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    const confirmed = window.confirm(
      "Esta accion borrara el producto y sus archivos multimedia. Deseas continuar?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/catalog/products/${productId}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo eliminar el producto");
      }

      setMessage("Producto eliminado.");
      await fetchProducts();
    } catch (deleteError) {
      const deleteMessage =
        deleteError instanceof Error
          ? deleteError.message
          : "Error al eliminar producto";
      setError(deleteMessage);
    }
  };

  const onFilesSelected = (productId: string, files: FileList | null) => {
    const array = files ? Array.from(files) : [];

    setSelectedFiles((previous) => ({
      ...previous,
      [productId]: array,
    }));
  };

  const uploadMedia = async (productId: string) => {
    if (!headers) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    const files = selectedFiles[productId] ?? [];

    if (files.length === 0) {
      setError("Selecciona al menos un archivo para subir.");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("media", file);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/catalog/products/${productId}/media`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo subir la multimedia");
      }

      setSelectedFiles((previous) => ({
        ...previous,
        [productId]: [],
      }));

      setMessage("Archivos subidos correctamente.");
      await fetchProducts();
    } catch (uploadError) {
      const uploadMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Error al subir archivos";
      setError(uploadMessage);
    }
  };

  const deleteMedia = async (productId: string, mediaId: string) => {
    if (!headers) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/catalog/products/${productId}/media/${mediaId}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "No se pudo eliminar el archivo");
      }

      setMessage("Archivo eliminado.");
      await fetchProducts();
    } catch (mediaError) {
      const mediaMessage =
        mediaError instanceof Error
          ? mediaError.message
          : "Error al eliminar archivo";
      setError(mediaMessage);
    }
  };

  return (
    <main className="mife-grid min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mife-blue)]">
                Administracion MIFE
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Panel de catalogo</h1>
              <p className="mt-2 text-sm text-[var(--mife-muted)]">
                Crea productos, define precio, publica y administra fotos/videos
                desde tu computador.
              </p>
            </div>

            <Link href="/" className="outline-btn rounded-xl px-5 py-3 text-sm font-semibold">
              Volver al sitio
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-[var(--mife-line)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Seguridad del panel</h2>
          <p className="mt-2 text-sm text-[var(--mife-muted)]">
            Ingresa el token de administrador (ADMIN_TOKEN de la API).
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Token administrador"
              className="w-full rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
            />
            <button
              type="button"
              onClick={saveToken}
              className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Guardar token
            </button>
            <button
              type="button"
              onClick={clearToken}
              className="outline-btn rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Cerrar sesion
            </button>
          </div>
        </section>

        {limits ? (
          <section className="rounded-3xl border border-[var(--mife-line)] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Limites de carga</h2>
            <p className="mt-2 text-sm text-[var(--mife-muted)]">
              Fotos maximas: {limits.maxImagesPerProduct} por producto. Videos
              maximos: {limits.maxVideosPerProduct} por producto.
            </p>
            <p className="mt-1 text-sm text-[var(--mife-muted)]">
              Peso max foto: {formatBytes(limits.maxImageSizeBytes)}. Peso max
              video: {formatBytes(limits.maxVideoSizeBytes)}. Peso total por
              producto: {formatBytes(limits.maxTotalBytesPerProduct)}.
            </p>
          </section>
        ) : null}

        <section className="rounded-3xl border border-[var(--mife-line)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Crear producto</h2>

          <form className="mt-4 grid gap-3" onSubmit={handleCreateProduct}>
            <input
              type="text"
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder="Nombre del producto"
              required
              className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
            />

            <textarea
              value={newProduct.description}
              onChange={(event) =>
                setNewProduct((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Descripcion del producto"
              rows={3}
              required
              className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
            />

            <input
              type="number"
              min={0}
              step={1000}
              value={newProduct.priceCop}
              onChange={(event) =>
                setNewProduct((previous) => ({
                  ...previous,
                  priceCop: event.target.value,
                }))
              }
              placeholder="Precio en COP"
              required
              className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
            />

            <div>
              <button
                type="submit"
                disabled={!canUseAdminActions || creating}
                className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creando..." : "Crear producto"}
              </button>
            </div>
          </form>
        </section>

        {message ? (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="rounded-3xl border border-[var(--mife-line)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Productos del catalogo</h2>
            <button
              type="button"
              onClick={() => void fetchProducts()}
              disabled={!canUseAdminActions || loadingProducts}
              className="outline-btn rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingProducts ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {!canUseAdminActions ? (
            <p className="mt-4 text-sm text-[var(--mife-muted)]">
              Ingresa token para administrar el catalogo.
            </p>
          ) : null}

          {canUseAdminActions && products.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--mife-muted)]">
              No hay productos todavia.
            </p>
          ) : null}

          <div className="mt-6 grid gap-6">
            {products.map((product) => {
              const draft = drafts[product.id] ?? emptyDraft();
              const currentFiles = selectedFiles[product.id] ?? [];

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[var(--mife-line)] p-5"
                >
                  <div className="grid gap-3">
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) =>
                        updateProductField(product.id, "name", event.target.value)
                      }
                      className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
                    />

                    <textarea
                      value={draft.description}
                      rows={3}
                      onChange={(event) =>
                        updateProductField(
                          product.id,
                          "description",
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={draft.priceCop}
                        onChange={(event) =>
                          updateProductField(product.id, "priceCop", event.target.value)
                        }
                        className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
                      />

                      <select
                        value={draft.status}
                        onChange={(event) =>
                          updateProductField(product.id, "status", event.target.value)
                        }
                        className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void saveProduct(product.id)}
                        className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold"
                      >
                        Guardar cambios
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteProduct(product.id)}
                        className="rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
                      >
                        Eliminar producto
                      </button>
                    </div>

                    <div className="rounded-xl border border-[var(--mife-line)] bg-[var(--mife-bg)] p-4">
                      <p className="text-sm font-semibold">Subir fotos y videos</p>
                      <p className="mt-1 text-xs text-[var(--mife-muted)]">
                        Puedes seleccionar varios archivos a la vez desde tu
                        computador.
                      </p>

                      <input
                        type="file"
                        multiple
                        accept={ACCEPTED_MEDIA}
                        onChange={(event) =>
                          onFilesSelected(product.id, event.target.files)
                        }
                        className="mt-3 block w-full text-sm"
                      />

                      {currentFiles.length > 0 ? (
                        <p className="mt-2 text-xs text-[var(--mife-muted)]">
                          {currentFiles.length} archivo(s) listo(s) para subir.
                        </p>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void uploadMedia(product.id)}
                        disabled={currentFiles.length === 0}
                        className="mt-3 rounded-xl border border-[var(--mife-blue)] px-4 py-2 text-sm font-semibold text-[var(--mife-blue)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Subir seleccion
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Estado: {product.status === "published" ? "Publicado" : "Borrador"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--mife-muted)]">
                        Precio actual: {formatMoneyCop(product.priceCop)}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {product.media.length === 0 ? (
                        <p className="text-sm text-[var(--mife-muted)]">
                          Este producto aun no tiene archivos.
                        </p>
                      ) : null}

                      {product.media.map((media) => {
                        const src = resolveMediaUrl(media.url);

                        return (
                          <div
                            key={media.id}
                            className="rounded-xl border border-[var(--mife-line)] bg-white p-3"
                          >
                            {media.type === "image" ? (
                              <img
                                src={src}
                                alt={media.originalName}
                                className="h-36 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <video
                                src={src}
                                controls
                                className="h-36 w-full rounded-lg object-cover"
                              />
                            )}

                            <p className="mt-2 line-clamp-1 text-xs text-[var(--mife-muted)]">
                              {media.originalName}
                            </p>
                            <p className="mt-1 text-xs text-[var(--mife-muted)]">
                              {formatBytes(media.sizeBytes)}
                            </p>

                            <button
                              type="button"
                              onClick={() => void deleteMedia(product.id, media.id)}
                              className="mt-2 w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                            >
                              Eliminar archivo
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
