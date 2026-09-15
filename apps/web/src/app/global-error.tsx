"use client";

import { useEffect } from "react";

//esto hace que se capture y maneje cualquier error global en el enrutador de la aplicación
type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

//esto hace que se muestre un mensaje amigable al usuario cuando ocurre un error global

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Error global en app router:", error);
  }, [error]);

  // esto hace que se muestre el mensaje de error global al usuario
  return (
    <html lang="es-CO">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background:
              "radial-gradient(1200px 500px at 0% 0%, #e0f2fe 0%, #f8fafc 50%, #f1f5f9 100%)",
            color: "#0f172a",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "560px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#0c4a6e",
                fontWeight: 700,
              }}
            >
              Error de ejecucion
            </p>
            <h1
              style={{
                margin: "10px 0 0",
                fontSize: "28px",
                lineHeight: 1.2,
              }}
            >
              Ocurrio un problema al cargar la pagina
            </h1>
            <p
              style={{
                marginTop: "12px",
                marginBottom: 0,
                color: "#334155",
                lineHeight: 1.6,
              }}
            >
              Puedes intentar nuevamente. Si el problema persiste, recarga el
              navegador.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: "18px",
                border: "none",
                borderRadius: "10px",
                background: "#0369a1",
                color: "#ffffff",
                fontWeight: 600,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Intentar de nuevo
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}