"use client";

import Link from "next/link";
import { ProductEditorCard } from "./components/ProductEditorCard";
import { ACCEPTED_MEDIA } from "./constants";
import { useAdminCatalog } from "./hooks/useAdminCatalog";
import { emptyDraft, formatBytes } from "./utils";

export default function AdminPage() {
  const {
    token,
    setToken,
    limits,
    message,
    error,
    creating,
    loadingProducts,
    canUseAdminActions,
    visibleProducts,
    drafts,
    selectedFiles,
    newProduct,
    setNewProduct,
    saveToken,
    clearToken,
    handleCreateProduct,
    updateProductField,
    onFilesSelected,
    handleSaveProduct,
    handleDeleteProduct,
    handleUploadMedia,
    handleDeleteMedia,
    refreshProducts,
  } = useAdminCatalog();

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
              onClick={refreshProducts}
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

          {canUseAdminActions && visibleProducts.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--mife-muted)]">
              No hay productos todavia.
            </p>
          ) : null}

          <div className="mt-6 grid gap-6">
            {visibleProducts.map((product) => {
              return (
                <ProductEditorCard
                  key={product.id}
                  product={product}
                  draft={drafts[product.id] ?? emptyDraft()}
                  currentFiles={selectedFiles[product.id] ?? []}
                  acceptedMedia={ACCEPTED_MEDIA}
                  onChangeField={updateProductField}
                  onSaveProduct={handleSaveProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onSelectFiles={onFilesSelected}
                  onUploadMedia={handleUploadMedia}
                  onDeleteMedia={handleDeleteMedia}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
