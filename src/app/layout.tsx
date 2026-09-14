import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PowerLog — Bitácora de fuerza",
  description: "Planifica tu bloque, registra cada sesión y revisa tu progreso en sentadilla, banca y peso muerto.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className="min-h-full font-sans antialiased"><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
