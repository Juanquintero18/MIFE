"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createAdminProduct,
  deleteAdminProduct,
  deleteAdminProductMedia,
  fetchAdminProducts,
  fetchCatalogLimits,
  updateAdminProduct,
  uploadAdminProductMedia,
} from "../api";
import { LOCAL_STORAGE_TOKEN_KEY } from "../constants";
import type { CatalogLimits, CatalogProduct, ProductDraft } from "../types";
import { buildDraftMap, emptyDraft } from "../utils";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export interface UseAdminCatalogResult {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  limits: CatalogLimits | null;
  message: string;
  error: string;
  creating: boolean;
  loadingProducts: boolean;
  canUseAdminActions: boolean;
  visibleProducts: CatalogProduct[];
  drafts: Record<string, ProductDraft>;
  selectedFiles: Record<string, File[]>;
  newProduct: ProductDraft;
  setNewProduct: React.Dispatch<React.SetStateAction<ProductDraft>>;
  saveToken: () => void;
  clearToken: () => void;
  handleCreateProduct: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateProductField: (
    productId: string,
    field: keyof ProductDraft,
    value: string,
  ) => void;
  onFilesSelected: (productId: string, files: FileList | null) => void;
  handleSaveProduct: (productId: string) => void;
  handleDeleteProduct: (productId: string) => void;
  handleUploadMedia: (productId: string) => void;
  handleDeleteMedia: (productId: string, mediaId: string) => void;
  refreshProducts: () => void;
}

export function useAdminCatalog(): UseAdminCatalogResult {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) ?? "";
  });

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const [limits, setLimits] = useState<CatalogLimits | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState<ProductDraft>(emptyDraft());

  const trimmedToken = token.trim();
  const canUseAdminActions = trimmedToken.length > 0;
  const visibleProducts = canUseAdminActions ? products : [];

  async function loadProducts(overrideToken?: string): Promise<void> {
    const tokenForRequest = (overrideToken ?? token).trim();

    if (!tokenForRequest) {
      return;
    }

    setLoadingProducts(true);
    setError("");

    try {
      const allProducts = await fetchAdminProducts(tokenForRequest);
      setProducts(allProducts);
      setDrafts(buildDraftMap(allProducts));
      setMessage("Catalogo cargado correctamente.");
    } catch (fetchError) {
      setError(toErrorMessage(fetchError, "Error al consultar productos"));
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    const loadLimits = async () => {
      const loadedLimits = await fetchCatalogLimits();
      setLimits(loadedLimits);
    };

    void loadLimits();
  }, []);

  const saveToken = () => {
    const trimmed = token.trim();
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, trimmed);
    setToken(trimmed);
    setMessage("Token guardado en este navegador.");
    setError("");

    if (trimmed) {
      void loadProducts(trimmed);
    }
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

    if (!canUseAdminActions) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await createAdminProduct(trimmedToken, {
        name: newProduct.name,
        description: newProduct.description,
        priceCop: Number(newProduct.priceCop),
      });

      setNewProduct(emptyDraft());
      setMessage("Producto creado en borrador.");
      await loadProducts();
    } catch (createError) {
      setError(toErrorMessage(createError, "Error al crear producto"));
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
    if (!canUseAdminActions) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    const draft = drafts[productId];
    if (!draft) {
      return;
    }

    setError("");

    try {
      await updateAdminProduct(trimmedToken, productId, {
        name: draft.name,
        description: draft.description,
        priceCop: Number(draft.priceCop),
        status: draft.status,
      });

      setMessage("Producto actualizado.");
      await loadProducts();
    } catch (updateError) {
      setError(toErrorMessage(updateError, "Error al actualizar producto"));
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!canUseAdminActions) {
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
      await deleteAdminProduct(trimmedToken, productId);

      setMessage("Producto eliminado.");
      await loadProducts();
    } catch (deleteError) {
      setError(toErrorMessage(deleteError, "Error al eliminar producto"));
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
    if (!canUseAdminActions) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    const files = selectedFiles[productId] ?? [];

    if (files.length === 0) {
      setError("Selecciona al menos un archivo para subir.");
      return;
    }

    setError("");

    try {
      await uploadAdminProductMedia(trimmedToken, productId, files);

      setSelectedFiles((previous) => ({
        ...previous,
        [productId]: [],
      }));

      setMessage("Archivos subidos correctamente.");
      await loadProducts();
    } catch (uploadError) {
      setError(toErrorMessage(uploadError, "Error al subir archivos"));
    }
  };

  const deleteMedia = async (productId: string, mediaId: string) => {
    if (!canUseAdminActions) {
      setError("Primero debes ingresar el token de administrador.");
      return;
    }

    try {
      await deleteAdminProductMedia(trimmedToken, productId, mediaId);

      setMessage("Archivo eliminado.");
      await loadProducts();
    } catch (mediaError) {
      setError(toErrorMessage(mediaError, "Error al eliminar archivo"));
    }
  };

  const handleSaveProduct = (productId: string) => {
    void saveProduct(productId);
  };

  const handleDeleteProduct = (productId: string) => {
    void deleteProduct(productId);
  };

  const handleUploadMedia = (productId: string) => {
    void uploadMedia(productId);
  };

  const handleDeleteMedia = (productId: string, mediaId: string) => {
    void deleteMedia(productId, mediaId);
  };

  const refreshProducts = () => {
    void loadProducts();
  };

  return {
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
  };
}
