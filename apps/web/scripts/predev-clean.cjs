const fs = require("fs");
const path = require("path");

const nextDir = path.join(process.cwd(), ".next");

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
} catch (error) {
  const code = error && typeof error === "object" ? error.code : "UNKNOWN";

  if (["ENOTEMPTY", "EPERM", "EACCES", "EBUSY"].includes(code)) {
    console.error(
      "No se pudo limpiar apps/web/.next. Parece que ya hay una instancia de Next dev ejecutandose.",
    );
    console.error(
      "Cierra la instancia anterior o usa la URL que ya esta activa (ejemplo: http://localhost:3000).",
    );
    process.exit(1);
  }

  throw error;
}