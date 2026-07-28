import Image from "next/image";

import { formatBytes, formatMoneyCop, resolveMediaUrl } from "../utils";
import type { CatalogProduct, ProductDraft } from "../types";

interface ProductEditorCardProps {
  product: CatalogProduct;
  draft: ProductDraft;
  currentFiles: File[];
  acceptedMedia: string;
  onChangeField: (
    productId: string,
    field: keyof ProductDraft,
    value: string,
  ) => void;
  onSaveProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onSelectFiles: (productId: string, files: FileList | null) => void;
  onUploadMedia: (productId: string) => void;
  onDeleteMedia: (productId: string, mediaId: string) => void;
}

export function ProductEditorCard({
  product,
  draft,
  currentFiles,
  acceptedMedia,
  onChangeField,
  onSaveProduct,
  onDeleteProduct,
  onSelectFiles,
  onUploadMedia,
  onDeleteMedia,
}: ProductEditorCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--mife-line)] p-5">
      <div className="grid gap-3">
        <input
          type="text"
          value={draft.name}
          onChange={(event) =>
            onChangeField(product.id, "name", event.target.value)
          }
          className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
        />

        <textarea
          value={draft.description}
          rows={3}
          onChange={(event) =>
            onChangeField(product.id, "description", event.target.value)
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
              onChangeField(product.id, "priceCop", event.target.value)
            }
            className="rounded-xl border border-[var(--mife-line)] px-4 py-3 text-sm outline-none focus:border-[var(--mife-blue)]"
          />

          <select
            value={draft.status}
            onChange={(event) =>
              onChangeField(product.id, "status", event.target.value)
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
            onClick={() => onSaveProduct(product.id)}
            className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold"
          >
            Guardar cambios
          </button>

          <button
            type="button"
            onClick={() => onDeleteProduct(product.id)}
            className="rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
          >
            Eliminar producto
          </button>
        </div>

        <div className="rounded-xl border border-[var(--mife-line)] bg-[var(--mife-bg)] p-4">
          <p className="text-sm font-semibold">Subir fotos y videos</p>
          <p className="mt-1 text-xs text-[var(--mife-muted)]">
            Puedes seleccionar varios archivos a la vez desde tu computador.
          </p>

          <input
            type="file"
            multiple
            accept={acceptedMedia}
            onChange={(event) => onSelectFiles(product.id, event.target.files)}
            className="mt-3 block w-full text-sm"
          />

          {currentFiles.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--mife-muted)]">
              {currentFiles.length} archivo(s) listo(s) para subir.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onUploadMedia(product.id)}
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
                  <Image
                    src={src}
                    alt={media.originalName}
                    width={480}
                    height={240}
                    unoptimized
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
                  onClick={() => onDeleteMedia(product.id, media.id)}
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
}
