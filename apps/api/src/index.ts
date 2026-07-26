import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import cors from "cors";
import dotenv from "dotenv";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import multer from "multer";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

// Origen permitido para el frontend (acepta lista separada por comas).
const webOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// Token simple para proteger endpoints de administrador.
const adminToken = process.env.ADMIN_TOKEN ?? "mife-dev-admin-token";

// Limites de catalogo para mantener rendimiento y costos controlados.
const MAX_IMAGES_PER_PRODUCT = 12;
const MAX_VIDEOS_PER_PRODUCT = 2;
const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 120 * 1024 * 1024;
const MAX_TOTAL_BYTES_PER_PRODUCT = 250 * 1024 * 1024;
const MAX_FILES_PER_PRODUCT = MAX_IMAGES_PER_PRODUCT + MAX_VIDEOS_PER_PRODUCT;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

const uploadsRoot = path.resolve(process.cwd(), "uploads");
const productsUploadsRoot = path.join(uploadsRoot, "products");
const dataRoot = path.resolve(process.cwd(), "data");
const catalogFilePath = path.join(dataRoot, "catalog.json");

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

interface CatalogStore {
  products: CatalogProduct[];
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureStorage(): void {
  ensureDir(uploadsRoot);
  ensureDir(productsUploadsRoot);
  ensureDir(dataRoot);
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function routeParamToString(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0] ?? "";
  }

  return param ?? "";
}

function emptyStore(): CatalogStore {
  return { products: [] };
}

function loadStore(): CatalogStore {
  ensureStorage();

  if (!fs.existsSync(catalogFilePath)) {
    return emptyStore();
  }

  try {
    const raw = fs.readFileSync(catalogFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CatalogStore>;

    if (!Array.isArray(parsed.products)) {
      return emptyStore();
    }

    return { products: parsed.products };
  } catch {
    // Si el archivo esta corrupto, iniciamos en vacio para no bloquear la API.
    return emptyStore();
  }
}

function saveStore(store: CatalogStore): void {
  ensureStorage();
  fs.writeFileSync(catalogFilePath, JSON.stringify(store, null, 2), "utf-8");
}

function findProduct(store: CatalogStore, productId: string): CatalogProduct | undefined {
  return store.products.find((product) => product.id === productId);
}

function fileUrlFor(productId: string, fileName: string): string {
  return `/uploads/products/${productId}/${fileName}`;
}

function deleteFileSafe(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignora fallas de borrado para no caer en error 500 innecesario.
  }
}

function deleteProductFolderSafe(productId: string): void {
  const cleanId = sanitizePathSegment(productId);
  const folder = path.join(productsUploadsRoot, cleanId);

  try {
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true });
    }
  } catch {
    // Ignora errores de limpieza de archivos.
  }
}

function removeUploadedFiles(files: Express.Multer.File[] | undefined): void {
  for (const file of files ?? []) {
    deleteFileSafe(file.path);
  }
}

function getAdminTokenFromRequest(req: Request): string {
  const headerToken = req.header("x-admin-token");
  if (headerToken) {
    return headerToken;
  }

  const authHeader = req.header("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = getAdminTokenFromRequest(req);

  if (!token || token !== adminToken) {
    res.status(401).json({
      ok: false,
      message: "No autorizado. Incluye x-admin-token valido.",
    });
    return;
  }

  next();
}

const store = loadStore();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const safeProductId = sanitizePathSegment(
      routeParamToString(req.params.productId),
    );

    if (!safeProductId) {
      cb(new Error("Producto invalido"), productsUploadsRoot);
      return;
    }

    const targetDir = path.join(productsUploadsRoot, safeProductId);
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE_BYTES,
    files: MAX_FILES_PER_PRODUCT,
  },
  fileFilter: (_req, file, cb) => {
    const isImage = IMAGE_MIME_TYPES.has(file.mimetype);
    const isVideo = VIDEO_MIME_TYPES.has(file.mimetype);

    if (!isImage && !isVideo) {
      cb(new Error("Formato no permitido. Usa JPG, PNG, WEBP, MP4 o WEBM."));
      return;
    }

    cb(null, true);
  },
});

ensureStorage();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (webOrigins.includes("*") || webOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origen no permitido por CORS"));
    },
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsRoot));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "mife-api" });
});

// Limites y configuracion para que el admin UI pinte reglas en pantalla.
app.get("/api/catalog/config", (_req, res) => {
  res.json({
    ok: true,
    limits: {
      maxImagesPerProduct: MAX_IMAGES_PER_PRODUCT,
      maxVideosPerProduct: MAX_VIDEOS_PER_PRODUCT,
      maxImageSizeBytes: MAX_IMAGE_SIZE_BYTES,
      maxVideoSizeBytes: MAX_VIDEO_SIZE_BYTES,
      maxTotalBytesPerProduct: MAX_TOTAL_BYTES_PER_PRODUCT,
      allowedImageTypes: Array.from(IMAGE_MIME_TYPES),
      allowedVideoTypes: Array.from(VIDEO_MIME_TYPES),
    },
  });
});

// Endpoint publico: solo productos publicados.
app.get("/api/catalog/products", (_req, res) => {
  const products = store.products
    .filter((product) => product.status === "published")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  res.json({ ok: true, products });
});

// Endpoint admin: trae todos los productos.
app.get("/api/admin/catalog/products", requireAdmin, (_req, res) => {
  const products = [...store.products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ ok: true, products });
});

// Crea un producto inicial en estado borrador.
app.post("/api/admin/catalog/products", requireAdmin, (req, res) => {
  const body = req.body as {
    name?: unknown;
    description?: unknown;
    priceCop?: unknown;
  };

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const priceCop = Number(body.priceCop);

  if (!name || !description || !Number.isFinite(priceCop) || priceCop < 0) {
    res.status(400).json({
      ok: false,
      message: "Datos invalidos. name, description y priceCop son obligatorios.",
    });
    return;
  }

  const now = new Date().toISOString();

  const product: CatalogProduct = {
    id: randomUUID(),
    name,
    description,
    priceCop,
    status: "draft",
    media: [],
    createdAt: now,
    updatedAt: now,
  };

  store.products.push(product);
  saveStore(store);

  res.status(201).json({ ok: true, product });
});

// Actualiza datos basicos y estado del producto.
app.put("/api/admin/catalog/products/:productId", requireAdmin, (req, res) => {
  const productId = routeParamToString(req.params.productId);
  const product = findProduct(store, productId);

  if (!product) {
    res.status(404).json({ ok: false, message: "Producto no encontrado" });
    return;
  }

  const body = req.body as {
    name?: unknown;
    description?: unknown;
    priceCop?: unknown;
    status?: unknown;
  };

  const nextName = body.name !== undefined ? String(body.name).trim() : product.name;
  const nextDescription =
    body.description !== undefined
      ? String(body.description).trim()
      : product.description;
  const nextPrice = body.priceCop !== undefined ? Number(body.priceCop) : product.priceCop;

  if (!nextName || !nextDescription || !Number.isFinite(nextPrice) || nextPrice < 0) {
    res.status(400).json({
      ok: false,
      message: "Datos invalidos. Verifica nombre, descripcion y precio.",
    });
    return;
  }

  if (body.status !== undefined && body.status !== "draft" && body.status !== "published") {
    res.status(400).json({
      ok: false,
      message: "Estado invalido. Usa draft o published.",
    });
    return;
  }

  product.name = nextName;
  product.description = nextDescription;
  product.priceCop = nextPrice;

  if (body.status === "draft" || body.status === "published") {
    product.status = body.status;
  }

  product.updatedAt = new Date().toISOString();
  saveStore(store);

  res.json({ ok: true, product });
});

// Elimina producto y su carpeta de archivos.
app.delete("/api/admin/catalog/products/:productId", requireAdmin, (req, res) => {
  const productId = routeParamToString(req.params.productId);
  const index = store.products.findIndex((product) => product.id === productId);

  if (index === -1) {
    res.status(404).json({ ok: false, message: "Producto no encontrado" });
    return;
  }

  const [deleted] = store.products.splice(index, 1);
  deleteProductFolderSafe(deleted.id);
  saveStore(store);

  res.json({ ok: true, deletedProductId: deleted.id });
});

// Carga fotos y videos desde carpeta local del admin.
app.post(
  "/api/admin/catalog/products/:productId/media",
  requireAdmin,
  upload.array("media", MAX_FILES_PER_PRODUCT),
  (req, res) => {
    const productId = routeParamToString(req.params.productId);
    const product = findProduct(store, productId);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (!product) {
      removeUploadedFiles(files);
      res.status(404).json({ ok: false, message: "Producto no encontrado" });
      return;
    }

    if (files.length === 0) {
      res.status(400).json({ ok: false, message: "Debes seleccionar al menos un archivo." });
      return;
    }

    let imagesCount = product.media.filter((item) => item.type === "image").length;
    let videosCount = product.media.filter((item) => item.type === "video").length;
    let totalBytes = product.media.reduce((sum, item) => sum + item.sizeBytes, 0);

    const mediaToAppend: CatalogMedia[] = [];

    for (const file of files) {
      const isImage = IMAGE_MIME_TYPES.has(file.mimetype);
      const isVideo = VIDEO_MIME_TYPES.has(file.mimetype);

      if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
        removeUploadedFiles(files);
        res.status(400).json({ ok: false, message: "Cada foto puede pesar maximo 6 MB." });
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
        removeUploadedFiles(files);
        res.status(400).json({ ok: false, message: "Cada video puede pesar maximo 120 MB." });
        return;
      }

      if (isImage && imagesCount >= MAX_IMAGES_PER_PRODUCT) {
        removeUploadedFiles(files);
        res.status(400).json({ ok: false, message: "Maximo 12 fotos por producto." });
        return;
      }

      if (isVideo && videosCount >= MAX_VIDEOS_PER_PRODUCT) {
        removeUploadedFiles(files);
        res.status(400).json({ ok: false, message: "Maximo 2 videos por producto." });
        return;
      }

      if (totalBytes + file.size > MAX_TOTAL_BYTES_PER_PRODUCT) {
        removeUploadedFiles(files);
        res.status(400).json({ ok: false, message: "Maximo total 250 MB por producto." });
        return;
      }

      if (isImage) {
        imagesCount += 1;
      }

      if (isVideo) {
        videosCount += 1;
      }

      totalBytes += file.size;

      const fileName = path.basename(file.path);

      mediaToAppend.push({
        id: randomUUID(),
        type: isVideo ? "video" : "image",
        url: fileUrlFor(product.id, fileName),
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
      });
    }

    product.media.push(...mediaToAppend);
    product.updatedAt = new Date().toISOString();
    saveStore(store);

    res.status(201).json({
      ok: true,
      productId: product.id,
      mediaAdded: mediaToAppend,
      counts: { images: imagesCount, videos: videosCount, totalBytes },
    });
  },
);

// Elimina un archivo multimedia puntual de un producto.
app.delete(
  "/api/admin/catalog/products/:productId/media/:mediaId",
  requireAdmin,
  (req, res) => {
    const productId = routeParamToString(req.params.productId);
    const product = findProduct(store, productId);

    if (!product) {
      res.status(404).json({ ok: false, message: "Producto no encontrado" });
      return;
    }

    const mediaId = routeParamToString(req.params.mediaId);
    const index = product.media.findIndex((item) => item.id === mediaId);

    if (index === -1) {
      res.status(404).json({ ok: false, message: "Archivo no encontrado" });
      return;
    }

    const [deleted] = product.media.splice(index, 1);
    product.updatedAt = new Date().toISOString();

    const fileSystemPath = path.join(uploadsRoot, deleted.url.replace(/^\//, ""));
    deleteFileSafe(fileSystemPath);

    saveStore(store);
    res.json({ ok: true, deletedMediaId: deleted.id });
  },
);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        ok: false,
        message: "Archivo demasiado pesado para la configuracion actual.",
      });
      return;
    }

    res.status(400).json({ ok: false, message: error.message });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ ok: false, message: error.message });
    return;
  }

  res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
