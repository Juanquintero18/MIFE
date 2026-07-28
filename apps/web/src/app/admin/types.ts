export type CatalogStatus = "draft" | "published";
export type MediaType = "image" | "video";

export interface CatalogMedia {
  id: string;
  type: MediaType;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  priceCop: number;
  status: CatalogStatus;
  media: CatalogMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogLimits {
  maxImagesPerProduct: number;
  maxVideosPerProduct: number;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  maxTotalBytesPerProduct: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
}

export interface ProductDraft {
  name: string;
  description: string;
  priceCop: string;
  status: CatalogStatus;
}
